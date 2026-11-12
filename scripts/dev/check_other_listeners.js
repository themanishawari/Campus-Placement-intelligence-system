process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');

['drive-management.html', 'my-drives.html'].forEach(f => {
  const content = fs.readFileSync('src/views/' + f, 'utf8');
  console.log('=== ' + f + ' ===');
  const ids = ['runBtn', 'kanbanBtn', 'tableBtn', 'searchInput'];
  ids.forEach(id => {
    console.log(`has id="${id}":`, content.includes(`id="${id}"`));
  });
});
