process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

// Read merged tailwind config
const twConfig = JSON.parse(fs.readFileSync('config/tailwind.config.json', 'utf8'));

// Read all extracted views
const viewIds = [
  'cohort-skills',
  'drive-management',
  'talent-discovery',
  'fairness-accreditation',
  'skill-profile',
  'target-gaps',
  'mock-reports',
  'learning-path',
  'my-drives',
  'privacy-consent'
];

const viewHtmls = {};
viewIds.forEach(id => {
  const p = path.join('src/views', `${id}.html`);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing extracted view: ${p}`);
  }
  viewHtmls[id] = fs.readFileSync(p, 'utf8');
});

console.log('All 10 views loaded successfully.');
