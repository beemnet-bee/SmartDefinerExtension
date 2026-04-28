from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

text_data = ""
try:
    with open("extracted_text.txt", "r", encoding="utf-8") as f:
        text_data = f.read()
except Exception as e:
    print("Could not load extracted_text.txt:", e)

@app.route('/search', methods=['GET'])
def search_text():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"results": []})
    
    paragraphs = text_data.split('\n\n')
    results = []
    
    pattern = re.compile(rf'\b{re.escape(query)}\b', re.IGNORECASE)
    
    current_source = "PDF Notes"
    for p in paragraphs:
        source_match = re.search(r'--- Source: (.*?) ---', p)
        if source_match:
            current_source = source_match.group(1)
        
        if pattern.search(p) and not source_match:
            clean_p = p.strip()
            if clean_p and len(clean_p) > 20: 
                results.append({
                    "context": clean_p[:300] + ('...' if len(clean_p) > 300 else ''),
                    "source": current_source
                })
            
            if len(results) >= 3:
                break
                
    return jsonify({"results": results})

if __name__ == '__main__':
    app.run(port=5000)
