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

  // Fetch real definition from a free API
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`)
    .then(res => res.json())
    .then(data => {
      let topDefs = [];
      
      if (Array.isArray(data) && data.length > 0) {
        let allDefs = [];
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
        let html = `<strong class="word">${text}</strong>`;
        
        topDefs.forEach((defObj, index) => {
          if (index === 1) { // Start wrapping alternative definitions
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
          html += `<div class="hover-hint">Hover for more meanings...</div>`;
        }
        
        tooltip.innerHTML = html;
      } else {
        tooltip.innerHTML = `<strong class="word">${text}</strong><div class="def">No definition found.</div>`;
      }
    })
    .catch(() => tooltip.innerHTML = `<strong class="word">${text}</strong><div class="def text-error">Error fetching definition.</div>`);
}

function removeTooltip() {
  const old = document.getElementById('ext-definition-tooltip');
  if (old) old.remove();
}
