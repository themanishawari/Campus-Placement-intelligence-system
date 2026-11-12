process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');
const dirs = [
  'cohort_skill_dashboard_proofpoint_vesit',
  'drive_management_allocation_proofpoint_vesit',
  'eligibility_talent_discovery_proofpoint_vesit',
  'fairness_accreditation_proofpoint_vesit',
  'mock_drive_performance_report_proofpoint',
  'my_drives_eligibility_proofpoint',
  'my_privacy_consent_proofpoint',
  'personal_learning_path_proofpoint',
  'student_skill_profile_proofpoint',
  'target_companies_skill_gaps_proofpoint'
];
const allColors = {};
const allFonts = {};
dirs.forEach(d => {
  const p = path.join('reference/stitch-exports', d, 'code.html');
  const txt = fs.readFileSync(p, 'utf8');
  const m = txt.match(/<script id=" tailwind-config\>([\s\S]*?)<\/script>/);
 if (m) {
 const tailwind = { config: {} };
 try {
 eval(m[1]);
 const ext = tailwind.config?.theme?.extend || {};
 if (ext.colors) Object.assign(allColors, ext.colors);
 if (ext.fontFamily) Object.assign(allFonts, ext.fontFamily);
 } catch (e) {
 console.log('Error evaling in', d, e.message);
 }
 }
});
console.log('Total merged color keys:', Object.keys(allColors).length);
console.log('Total merged font keys:', Object.keys(allFonts).length);
fs.writeFileSync('reference/merged_theme.json', JSON.stringify({ colors: allColors, fontFamily: allFonts }, null, 2));
console.log('Saved merged_theme.json successfully.');
