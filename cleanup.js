const fs = require('fs');
let lines = fs.readFileSync('src/pages/Reader.tsx', 'utf8').split('\\n');

// Find start
let startIdx = lines.findIndex(l => l.startsWith('const greekTokens = ['));
// Find end
let endIdx = lines.findIndex(l => l.startsWith('export const Reader ='));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync('src/pages/Reader.tsx', lines.join('\\n'));
  console.log('Successfully pruned variables');
} else {
  console.log('Not found', startIdx, endIdx);
}
