process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const content = fs.readFileSync(path.join('src/views', f), 'utf8');
  const buttons = [...content.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi)];
  const unhandled = [];
  buttons.forEach(b => {
    const attrs = b[1];
    const text = b[2].replace(/<[^>]+>/g, '').trim();
    if (!attrs.includes('onclick') && !attrs.includes('data-action') && !attrs.includes('id=')) {
      unhandled.push(text);
    }
  });
  console.log(`=== ${f} (Total buttons: ${buttons.length}, unhandled: ${unhandled.length}) ===`);
  if (unhandled.length > 0) {
    console.log('  Unhandled buttons:', unhandled.slice(0, 10).join(' | '));
  }
});
