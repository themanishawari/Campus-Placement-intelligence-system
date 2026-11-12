process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('scripts/build.js', 'utf8');
const matches = [...content.matchAll(/replace\([^)]+\)/g)];
matches.forEach(m => console.log(m[0]));
