process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const c = fs.readFileSync(path.join('src/views', f), 'utf8');
  const modalMatches = [...c.matchAll(/id=["']([^"']*(?:modal|toast)[^"']*)["']/gi)].map(m => m[1]);
  if (modalMatches.length > 0) {
    console.log(f, 'Modal/toast IDs:', modalMatches);
  }
});
