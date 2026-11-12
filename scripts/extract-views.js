process.chdir(require('path').resolve(__dirname, '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

const views = [
  { id: 'cohort-skills', dir: 'cohort_skill_dashboard_proofpoint_vesit', title: 'VESIT Cohort Skill Intelligence' },
  { id: 'drive-management', dir: 'drive_management_allocation_proofpoint_vesit', title: 'Campus Drive Management & Scheduling' },
  { id: 'talent-discovery', dir: 'eligibility_talent_discovery_proofpoint_vesit', title: 'Institutional Eligibility & Talent Discovery' },
  { id: 'fairness-accreditation', dir: 'fairness_accreditation_proofpoint_vesit', title: 'Fairness Check & Statutory Accreditation' },
  { id: 'skill-profile', dir: 'student_skill_profile_proofpoint', title: 'Student Skill Profile - Ananya Sharma' },
  { id: 'target-gaps', dir: 'target_companies_skill_gaps_proofpoint', title: 'Target Companies & Proofpoint Gap Matrix' },
  { id: 'mock-reports', dir: 'mock_drive_performance_report_proofpoint', title: 'Mock Drive Performance Diagnostics' },
  { id: 'learning-path', dir: 'personal_learning_path_proofpoint', title: 'Personal Learning Path & Remediation' },
  { id: 'my-drives', dir: 'my_drives_eligibility_proofpoint', title: 'My Drives & Institutional Eligibility' },
  { id: 'privacy-consent', dir: 'my_privacy_consent_proofpoint', title: 'My Privacy, Consent & DPDP Policy' }
];

console.warn('WARNING: this re-extracts from the raw Stitch exports and overwrites src/views/*.html (including manual patches).');
fs.mkdirSync('src/views', { recursive: true });

views.forEach(v => {
  const p = path.join('reference/stitch-exports', v.dir, 'code.html');
  const txt = fs.readFileSync(p, 'utf8');
  const m = txt.match(/<main([^>]*)>([\s\S]*?)<\/main>/);
  if (m) {
    fs.writeFileSync(path.join('src/views', `${v.id}.html`), m[2].trim(), 'utf8');
    console.log(`Extracted ${v.id}: ${m[2].trim().length} chars`);
  } else {
    console.error(`Failed to match <main> in ${v.dir}`);
  }
});
