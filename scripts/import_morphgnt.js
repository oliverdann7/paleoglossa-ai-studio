import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://raw.githubusercontent.com/Clear-Bible/macula-greek/main/Nestle1904/TSV/macula-greek.tsv';
const outputPath = path.join(process.cwd(), 'public', 'data', 'gnt');

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

console.log("Fetching Macula Greek from", url);

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to fetch, status code: ${res.statusCode}`);
    return;
  }
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const lines = data.split('\n').filter(l => l.trim().length > 0);
    console.log(`Received ${lines.length} lines`);
    
    // Header for Macula TSV:
    // xml:id	ref	role	class	type	gloss	text	after	lemma	normalized	strong	morph	domain	ln	frame	gender	case	number	person	tense	voice	mood
    // e.g. n1001001001	MAT 1:1!1	...
    
    // Just parse MAT 1 for MVP
    const mat1Lines = lines.filter(l => l.includes('MAT 1:1!') || l.includes('MAT 1:2!')); 
    
    console.log(`Found ${mat1Lines.length} lines for MAT 1:1-2`);
  });
}).on('error', (err) => {
  console.error('Error fetching:', err.message);
});
