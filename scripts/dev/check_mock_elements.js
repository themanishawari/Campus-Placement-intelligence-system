process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/mock-reports.html', 'utf8');
console.log('has id="code-diff-modal":', content.includes('id="code-diff-modal"'));
console.log('has id="proctor-log":', content.includes('id="proctor-log"'));
