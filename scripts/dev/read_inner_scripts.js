process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');

['drive-management.html', 'my-drives.html', 'talent-discovery.html'].forEach(f => {
  const content = fs.readFileSync('src/views/' + f, 'utf8');
  const scripts = [...content.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  console.log('=== ' + f + ' === (scripts: ' + scripts.length + ')');
  scripts.forEach((s, i) => console.log(`Script ${i}:\n${s}\n`));
});
