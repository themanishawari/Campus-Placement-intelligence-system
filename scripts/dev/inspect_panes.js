process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/talent-discovery.html', 'utf8');

const s1 = content.indexOf('SECTION 1: LEFT PANE');
const s2 = content.indexOf('SECTION 2: RIGHT PANE');

console.log('s1 around:', content.substring(s1 - 40, s1 + 180));
console.log('s2 around:', content.substring(s2 - 40, s2 + 180));
