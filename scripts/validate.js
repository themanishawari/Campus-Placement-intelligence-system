process.chdir(require('path').resolve(__dirname, '..')); // run from project root regardless of cwd
const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');

// Check script tags for any JS syntax errors
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Inline script tags found:', scripts.length);

scripts.forEach((s, idx) => {
  try {
    // Attempt parse
    new Function(s[1]);
    console.log(`Script ${idx} parsed without syntax errors.`);
  } catch (err) {
    console.error(`Script ${idx} error:`, err.message);
  }
});

// Check if all view IDs exist
const viewIds = [
  'view-login',
  'view-cohort-skills',
  'view-drive-management',
  'view-talent-discovery',
  'view-fairness-accreditation',
  'view-skill-profile',
  'view-target-gaps',
  'view-mock-reports',
  'view-learning-path',
  'view-my-drives',
  'view-privacy-consent'
];

viewIds.forEach(id => {
  const exists = html.includes(`id="${id}"`);
  console.log(`View container ${id} exists:`, exists);
});

// Check if all modal IDs exist
const modalIds = [
  'modal-omnisearch',
  'drawer-notifications',
  'drawer-candidate',
  'modal-new-drive',
  'modal-outreach',
  'modal-accreditation',
  'modal-code-diff',
  'modal-sandbox',
  'modal-audio-replay',
  'modal-telemetry',
  'modal-project-spec',
  'modal-code-review',
  'modal-dpdp-erase',
  'modal-whitepaper',
  'modal-helpdesk',
  'toastNotification'
];

modalIds.forEach(id => {
  const exists = html.includes(`id="${id}"`);
  console.log(`Modal container ${id} exists:`, exists);
});
