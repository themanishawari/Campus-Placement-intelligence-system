process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/mock-reports.html', 'utf8');
const idx = content.indexOf('code-diff-modal');
if (idx !== -1) {
  console.log(content.substring(idx - 50, idx + 600));
}
