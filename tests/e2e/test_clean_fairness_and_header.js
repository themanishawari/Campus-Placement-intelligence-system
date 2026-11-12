const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9245;

console.log('\n--- Checking Fairness Accreditation & Master Header Cleanups ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/fairness-accreditation'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:' + port + '/json', res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      const tabs = JSON.parse(d);
      const appTab = tabs.find(t => t.url.includes('localhost:3000'));
      if (!appTab) {
        console.error('No app tab found');
        proc.kill();
        process.exit(1);
      }

      const ws = new WebSocket(appTab.webSocketDebuggerUrl);
      const consoleErrors = [];

      ws.onopen = async () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));

        const sendEval = (expr) => new Promise(resolve => {
          const reqId = Math.floor(Math.random() * 1000000);
          const h = (m) => {
            const r = JSON.parse(m.data);
            if (r.method === 'Runtime.consoleAPICalled' && r.params.type === 'error') {
              consoleErrors.push(r.params.args.map(a => a.value || a.description).join(' '));
            }
            if (r.id === reqId) {
              ws.removeEventListener('message', h);
              resolve(r.result?.result?.value);
            }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
        });

        await new Promise(r => setTimeout(r, 600));

        const result = await sendEval(`
          (() => {
            const view = document.getElementById('view-fairness-accreditation');
            const header = document.getElementById('masterHeader');

            const viewText = view ? view.innerText : '';
            const headerText = header ? header.innerText : '';
            const bodyText = document.body.innerText;

            return {
              // Target phrase checks on fairness view
              hasDigitallySigned: viewText.includes('Digitally Signed: 24-Feb-2025'),
              hasEndorsement: viewText.includes('Institutional Endorsement: Approved'),
              hasExportSchema: viewText.includes('Export schema matches NAAC Portal'),
              hasCohortN: viewText.includes('Cohort N = 807'),
              hasCryptFrozen: viewText.includes('Audit Status: Cryptographically Frozen'),
              hasCardA: viewText.includes('Card A:'),
              hasCardB: viewText.includes('Card B:'),
              hasCardC: viewText.includes('Card C:'),
              hasRatio95: viewText.includes('Ratio: 0.95'),
              hasFlaggedAlert: viewText.includes('Flagged Alert'),
              hasAffirmativeNorms: viewText.includes('Affirmative Norms'),
              hasDiscriminatoryFlag: viewText.includes('Discriminatory Anomaly Flag'),
              hasEeocStd: viewText.includes('EEOC std >= 0.80'),
              hasAll12Drives: viewText.includes('All 12 Drives'),
              hasStateNorms: viewText.includes('State Norms'),
              has1Click: viewText.includes('1-Click') || viewText.includes('1-click'),
              hasExportNba: viewText.includes('Export NBA Tier-I SAR Matrix'),
              hasDisparateLong: viewText.includes('Automated disparate-impact parity verification'),
              hasAiPolicy: viewText.includes('AI Policy v5.4 • Human-in-the-Loop Active'),
              hasNodeId: viewText.includes('IN-VESIT-2025-A1'),
              hasStatutoryComplianceCore: viewText.includes('Statutory Compliance Core'),
              hasRequiresSignOff: viewText.includes('Requires Sign-off'),

              // Header checks
              headerHasAstNode: headerText.includes('mum-in-vesit-prod-01') || bodyText.includes('mum-in-vesit-prod-01'),
              hasPersonaDropdownMenu: !!document.getElementById('personaMenu'),
              hasPersonaToggleBtn: !!document.getElementById('personaToggleBtn'),
              personaLabelText: document.getElementById('personaLabel')?.textContent.trim()
            };
          })()
        `);

        console.log('Fairness View phrase checks:');
        console.log('  hasDigitallySigned:', result.hasDigitallySigned);
        console.log('  hasEndorsement:', result.hasEndorsement);
        console.log('  hasExportSchema:', result.hasExportSchema);
        console.log('  hasCohortN:', result.hasCohortN);
        console.log('  hasCryptFrozen:', result.hasCryptFrozen);
        console.log('  hasCardA:', result.hasCardA);
        console.log('  hasCardB:', result.hasCardB);
        console.log('  hasCardC:', result.hasCardC);
        console.log('  hasRatio95:', result.hasRatio95);
        console.log('  hasFlaggedAlert:', result.hasFlaggedAlert);
        console.log('  hasAffirmativeNorms:', result.hasAffirmativeNorms);
        console.log('  hasDiscriminatoryFlag:', result.hasDiscriminatoryFlag);
        console.log('  hasEeocStd:', result.hasEeocStd);
        console.log('  hasAll12Drives:', result.hasAll12Drives);
        console.log('  hasStateNorms:', result.hasStateNorms);
        console.log('  has1Click:', result.has1Click);
        console.log('  hasExportNba:', result.hasExportNba);
        console.log('  hasDisparateLong:', result.hasDisparateLong);
        console.log('  hasAiPolicy:', result.hasAiPolicy);
        console.log('  hasNodeId:', result.hasNodeId);
        console.log('  hasStatutoryComplianceCore:', result.hasStatutoryComplianceCore);
        console.log('  hasRequiresSignOff (should be false):', result.hasRequiresSignOff);

        console.log('\nMaster Header & Persona checks:');
        console.log('  headerHasAstNode (should be false):', result.headerHasAstNode);
        console.log('  hasPersonaDropdownMenu (should be false):', result.hasPersonaDropdownMenu);
        console.log('  hasPersonaToggleBtn (should be false):', result.hasPersonaToggleBtn);
        console.log('  personaLabelText:', JSON.stringify(result.personaLabelText));
        console.log('  consoleErrors captured:', consoleErrors.length);

        const allPassed = !result.hasDigitallySigned &&
                          !result.hasEndorsement &&
                          !result.hasExportSchema &&
                          !result.hasCohortN &&
                          !result.hasCryptFrozen &&
                          !result.hasCardA &&
                          !result.hasCardB &&
                          !result.hasCardC &&
                          !result.hasRatio95 &&
                          !result.hasFlaggedAlert &&
                          !result.hasAffirmativeNorms &&
                          !result.hasDiscriminatoryFlag &&
                          !result.hasEeocStd &&
                          !result.hasAll12Drives &&
                          !result.hasStateNorms &&
                          !result.has1Click &&
                          !result.hasExportNba &&
                          !result.hasDisparateLong &&
                          !result.hasAiPolicy &&
                          !result.hasNodeId &&
                          !result.hasStatutoryComplianceCore &&
                          !result.hasRequiresSignOff &&
                          !result.headerHasAstNode &&
                          !result.hasPersonaDropdownMenu &&
                          !result.hasPersonaToggleBtn &&
                          consoleErrors.length === 0;

        console.log('\nAll checks passed:', allPassed);

        ws.close();
        proc.kill();
        process.exit(allPassed ? 0 : 1);
      };
    });
  });
}, 2000);

