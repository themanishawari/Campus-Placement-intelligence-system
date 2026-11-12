process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
const code = scripts[7][1];
const lines = code.split('\n');

for (let i = 1; i <= lines.length; i++) {
  const slice = lines.slice(0, i).join('\n');
  try {
    new Function(slice);
  } catch (err) {
    if (err.message.includes('Invalid regular expression')) {
      console.log(`Failed at line ${i}: ${lines[i - 1]}`);
      break;
    }
  }
}
