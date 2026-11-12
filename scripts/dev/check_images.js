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
dirs.forEach(d => {
  const p = path.join('reference/stitch-exports', d, 'code.html');
  const txt = fs.readFileSync(p, 'utf8');
  const imgs = [...txt.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  if (imgs.length > 0) {
    console.log(d, 'Images count:', imgs.length);
    imgs.forEach(img => console.log('  ', img.slice(0, 90)));
  } else {
    console.log(d, 'No img tags');
  }
});
