process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/fairness-accreditation.html', 'utf8');
const matches = [...content.matchAll(/onclick=["'][^"']*getElementById[^"']*["']/gi)].map(m => m[0]);
console.log('fairness-accreditation getElementById matches:', matches);
