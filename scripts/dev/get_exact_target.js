process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/talent-discovery.html', 'utf8');
const idx = content.indexOf('SECTION 1: LEFT PANE');
console.log(JSON.stringify(content.substring(idx - 150, idx + 150)));
