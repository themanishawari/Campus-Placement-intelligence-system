process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const c = fs.readFileSync(path.join('src/views', f), 'utf8');
  const hasAside = c.includes('<aside');
  const hasHeader = c.includes('<header');
  console.log(f, 'hasAside:', hasAside, 'hasHeader:', hasHeader);
});
