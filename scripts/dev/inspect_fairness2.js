process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/fairness-accreditation.html', 'utf8');
const idx = content.indexOf("onclick=\"document.getElementById('");
if (idx !== -1) {
  console.log(content.substring(idx - 100, idx + 200));
}
