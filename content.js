document.addEventListener('mouseup', async () => {
  const selectionObj = window.getSelection();
  const selection = selectionObj.toString().trim();
  
  if (selection.length > 0 && selection.split(' ').length <= 3) { // Only for short phrases
    const rect = selectionObj.getRangeAt(0).getBoundingClientRect();
    
    // Grab a larger chunk of context (e.g. the whole question and options block)
    let container = selectionObj.anchorNode;
    if (container && container.nodeType === 3) container = container.parentElement;
    
    // Climb up the DOM tree until we have a decent amount of text for context
    while (container && container.innerText && container.innerText.length < 300 && container.parentElement) {
      container = container.parentElement;
    }
    const contextText = container ? container.innerText : "";

    showTooltip(selection, rect, contextText);
  } else {
    removeTooltip();
  }
});

function showTooltip(text, rect, contextText) {
  removeTooltip(); // Clear any existing tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'ext-definition-tooltip';
  tooltip.innerHTML = `<strong class="word">${text}</strong><span>Loading...</span>`;
  
  // Position it slightly higher and centered above the text
  tooltip.style.left = `${Math.max(0, rect.left + window.scrollX + (rect.width / 2) - 160)}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 50}px`;
  document.body.appendChild(tooltip);

  // Adjust top if it goes offscreen above
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.top < 0) {
    tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
  }

  // Fetch real definition from a free API & local PDF dictionary
  Promise.all([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`).then(res => res.ok ? res.json() : []).catch(() => []),
    fetch(`http://127.0.0.1:5000/search?q=${text}`).then(res => res.ok ? res.json() : { results: [] }).catch(() => ({ results: [] }))
  ]).then(([data, pdfData]) => {
      let topDefs = [];
      let allDefs = [];
      let html = `<strong class="word">${text}</strong>`;
      
      if (pdfData && pdfData.results && pdfData.results.length > 0) {
        html += `<div class="pdf-results" style="margin-bottom: 12px; border-bottom: 1px solid var(--ext-border); padding-bottom: 8px;">`;
        html += `<div style="font-size: 11px; margin-bottom: 4px; color: var(--ext-pos-text)"><strong>From your PDFs:</strong></div>`;
        pdfData.results.forEach((res, i) => {
           if (i > 0) html += `<div class="expanded-content">`;
           html += `<div class="def" style="margin-bottom: 4px; font-style: italic;">"...${res.context}..."</div>`;
           html += `<div class="example" style="font-size: 10px; color: var(--ext-hint-text); text-align: right;">- ${res.source}</div>`;
        });
        html += `</div>`;
      }
      
      if (Array.isArray(data) && data.length > 0) {
        // Flatten definitions with their part of speech
        data.forEach(entry => {
          entry.meanings?.forEach(m => {
            m.definitions?.forEach(d => {
              allDefs.push({ 
                definition: d.definition, 
                example: d.example, 
                synonyms: d.synonyms,
                partOfSpeech: m.partOfSpeech,
                score: 0
              });
            });
          });
        });
        
        if (allDefs.length > 0) {
          if (contextText) {
            // Get words from context (ignore punctuation and very short words)
            const contextWords = contextText.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3);
            
            allDefs.forEach(defObj => {
              // Include the definition text, examples, and synonyms in scoring
              const defDetails = [defObj.definition, defObj.example, ...(defObj.synonyms || [])].join(" ").toLowerCase();
              
              contextWords.forEach(cw => {
                if (cw !== text.toLowerCase() && defDetails.includes(cw)) {
                  defObj.score++;
                }
              });
            });
            
            // Sort by score descending
            allDefs.sort((a, b) => b.score - a.score);
          }
          
          // Pick up to 3 most relevant definitions to provide longer, diverse context
          topDefs = allDefs.slice(0, Math.min(3, allDefs.length));
        }
      }

      if (topDefs.length > 0) {
        if (!html.includes('<strong')) {
            html += `<strong class="word">${text}</strong>`;
        }
        
        topDefs.forEach((defObj, index) => {
          if (index === 1 && !html.includes('expanded-content')) { // Start wrapping alternative definitions
            html += `<div class="expanded-content">`;
          }

          html += `<div class="def-container">`;
          if (defObj.partOfSpeech) {
            html += `<span class="pos">${defObj.partOfSpeech}</span>`;
          }
          html += `<div class="def">${defObj.definition}</div>`;
          if (defObj.example) {
            html += `<div class="example">" ${defObj.example} "</div>`;
          }
          if (defObj.synonyms && defObj.synonyms.length > 0) {
            html += `<div class="example"><strong>Synonyms:</strong> ${defObj.synonyms.slice(0, 3).join(", ")}</div>`;
          }
          html += `</div>`;
        });

        if (topDefs.length > 1) {
          html += `</div>`; // Close expanded-content
        }
        if (topDefs.length > 1 || (pdfData && pdfData.results && pdfData.results.length > 1)) {
          html += `<div class="hover-hint">Hover for more meanings/notes...</div>`;
        }
        
        tooltip.innerHTML = html;
      } else if (pdfData && pdfData.results && pdfData.results.length > 0) {
        if (pdfData.results.length > 1) {
            html += `</div>`;
            html += `<div class="hover-hint">Hover for more notes...</div>`;
        }
        tooltip.innerHTML = html;
      } else {
        tooltip.innerHTML = `<strong class="word">${text}</strong><div class="def">No definition or PDF notes found.</div>`;
      }
    })
    .catch((err) => {
        console.error(err);
        tooltip.innerHTML = `<strong class="word">${text}</strong><div class="def text-error">Error fetching definition/notes.</div>`;
    });
}

function removeTooltip() {
  const old = document.getElementById('ext-definition-tooltip');
  if (old) old.remove();
}

// ==========================================
// STEALTH MODE: Hide on Blur
// ==========================================
window.addEventListener('blur', () => {
  removeTooltip();
  
  // Optionally clear the highlighted text selection as well
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
});
