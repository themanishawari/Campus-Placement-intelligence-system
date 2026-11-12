process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Script 7 length:', scripts[7][1].length);
console.log('Script 7 start:', scripts[7][1].slice(0, 300));

// Find error line
try {
  new Function(scripts[7][1]);
} catch (err) {
  console.log('Error message:', err.message);
  console.log('Error stack:', err.stack);
}
