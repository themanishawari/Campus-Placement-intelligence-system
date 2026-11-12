process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const content = fs.readFileSync(path.join('src/views', f), 'utf8');
  const matches = [...content.matchAll(/<([a-z0-9]+)[^>]*class=["'][^"']*\b(fixed|sticky)\b[^"']*["'][^>]*>/gi)];
  if (matches.length > 0) {
    console.log('=== ' + f + ' ===');
    matches.forEach(m => console.log('  ' + m[0].slice(0, 100)));
  }
});
