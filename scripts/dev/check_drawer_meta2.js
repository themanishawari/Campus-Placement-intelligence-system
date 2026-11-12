process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const idx = html.indexOf("document.getElementById('candidateDrawerMeta')");
if (idx !== -1) {
  console.log(html.substring(idx - 50, idx + 200));
}
