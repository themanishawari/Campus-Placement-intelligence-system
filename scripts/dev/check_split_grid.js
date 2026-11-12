process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('src/views/talent-discovery.html', 'utf8');
const idx = html.indexOf('Dual Pane Split Grid');
if (idx !== -1) {
  console.log(html.substring(idx - 50, idx + 400));
}
