process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const content = fs.readFileSync(path.join('src/views', f), 'utf8');
  const fixedMatches = [...content.matchAll(/class=["'][^"']*\b(fixed|sticky)\b[^"']*["']/gi)].map(m => m[0]);
  const plMatches = [...content.matchAll(/class=["'][^"']*\b(pl-64|pl-72)\b[^"']*["']/gi)].map(m => m[0]);
  console.log(f, 'Fixed/sticky:', fixedMatches.length, 'pl-64/72:', plMatches.length);
  if (plMatches.length > 0) {
    plMatches.forEach(m => console.log('   ' + m));
  }
});
