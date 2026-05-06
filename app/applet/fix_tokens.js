const fs = require('fs');
let content = fs.readFileSync('src/data/tokens.ts', 'utf8');

content = content.replace(/language: (["'])Greek\1/g, 'language: \\"Ancient Greek\\"');
content = content.replace(/language: (["'])Hebrew\1/g, 'language: \\"Biblical Hebrew\\"');
content = content.replace(/language: (["'])Egyptian\1/g, 'language: \\"Egyptian Hieroglyphs\\"');
content = content.replace(/language: (["'])Sanskrit\1/g, 'language: \\"Vedic Sanskrit\\"');
content = content.replace(/language: (["'])Latin\1/g, 'language: \\"Classical Latin\\"');
content = content.replace(/language: (["'])Syriac\1/g, 'language: \\"Classical Syriac\\"');

fs.writeFileSync('src/data/tokens.ts', content);
