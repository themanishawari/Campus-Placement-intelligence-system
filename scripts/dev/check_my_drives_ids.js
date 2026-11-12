process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const content = fs.readFileSync('src/views/my-drives.html', 'utf8');

['drive-search', 'view-kanban-btn', 'view-table-btn', 'drives-grid', 'table-view-section'].forEach(id => {
  console.log(`my-drives has "${id}":`, content.includes(`id="${id}"`));
});
