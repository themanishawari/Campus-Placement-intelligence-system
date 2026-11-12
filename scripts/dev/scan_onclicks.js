process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/views');
files.forEach(f => {
  const content = fs.readFileSync(path.join('src/views', f), 'utf8');
  const onClicks = [...content.matchAll(/onclick=["']([^"']+)["']/gi)].map(m => m[1]);
  if (onClicks.length > 0) {
    console.log('=== ' + f + ' ===');
    onClicks.forEach(oc => {
      const idMatch = oc.match(/getElementById\(['"]([^'"]+)['"]\)/);
      if (idMatch) {
        const id = idMatch[1];
        const exists = content.includes(`id="${id}"`) || content.includes(`id='${id}'`);
        console.log(`  onclick references "${id}" -> exists in file: ${exists}`);
      } else {
        console.log(`  onclick function: ${oc.slice(0, 60)}`);
      }
    });
  }
});
