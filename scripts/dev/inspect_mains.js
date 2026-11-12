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
  const m = txt.match(/<main([^>]*)>([\s\S]*?)<\/main>/);
  if (m) {
    const attrs = m[1];
    const inner = m[2];
    console.log('=== ' + d + ' ===');
    console.log('Main attrs:', attrs);
    console.log('Inner length:', inner.length);
    console.log('Inner starts with:', inner.trim().slice(0, 100).replace(/\n/g, ' '));
  }
});
