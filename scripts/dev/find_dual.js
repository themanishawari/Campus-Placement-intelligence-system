process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('src/views/talent-discovery.html', 'utf8');
const matches = [...html.matchAll(/(.{0,60}Dual.{0,60})/gi)].map(m => m[1]);
console.log('Dual matches:', matches);
