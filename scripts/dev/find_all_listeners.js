process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const content = fs.readFileSync(path.join('src/views', f), 'utf8');
  const listeners = [...content.matchAll(/([a-zA-Z0-9_$.]+)\.addEventListener\(/g)].map(m => m[1]);
  if (listeners.length > 0) {
    console.log(f, 'Listeners on:', listeners);
  }
});
