process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('src/views/talent-discovery.html', 'utf8');
console.log('has id="viewDualBtn":', html.includes('id="viewDualBtn"'));
console.log('has viewDualBtn anywhere:', html.indexOf('viewDualBtn'));
const idx = html.indexOf('viewDualBtn');
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 100));
}
