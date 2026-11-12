process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');
const html = fs.readFileSync('reference/stitch-exports/eligibility_talent_discovery_proofpoint_vesit/code.html', 'utf8');
const headerMatch = html.match(/<header[\s\S]*?<\/header>/);
if (headerMatch) {
  console.log(headerMatch[0]);
}
