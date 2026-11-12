process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('src/views/talent-discovery.html', 'utf8');
const lines = html.split('\n');
for (let i = 0; i < 70; i++) {
  if (lines[i].includes('<button') || lines[i].includes('Dual') || lines[i].includes('Rule') || lines[i].includes('Recruiter')) {
    console.log(`Line ${i}: ${lines[i]}`);
  }
}
