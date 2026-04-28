const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const dictsDir = path.join(__dirname, 'dicts');

async function parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return '';
    }
}

async function extractDefinitions() {
    const files = fs.readdirSync(dictsDir).filter(file => file.endsWith('.pdf'));
    let allText = '';
    
    for (const file of files) {
        const filePath = path.join(dictsDir, file);
        console.log(`Parsing ${file}...`);
        const text = await parsePDF(filePath);
        allText += 
`
--- Source: ${file} ---
${text}
`;
    }
    
    fs.writeFileSync('extracted_text.txt', allText);
    console.log('Finished extracting text to extracted_text.txt');
}

extractDefinitions();