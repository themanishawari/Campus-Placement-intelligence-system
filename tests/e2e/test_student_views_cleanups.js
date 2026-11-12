const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9245;

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/skill-profile'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:' + port + '/json', res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', async () => {
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

        console.log('\n--- Checking Student Skill Profile ---');
        await sendEval(`window.location.hash = '#/skill-profile'`);
        await new Promise(r => setTimeout(r, 300));
        const spHtml = await sendEval(`document.getElementById('view-skill-profile').innerHTML`);
        const hasLiveIngest = spHtml.includes('Continuous Ingestion Live');
        const hasUploadCert = spHtml.includes('Upload Certificate');
        const hasTracks = spHtml.includes('Tracks</span>');
        console.log('Has "Continuous Ingestion Live" (should be false):', hasLiveIngest);
        console.log('Has "Upload Certificate" (should be true):', hasUploadCert);
        console.log('Has "Tracks" column box (should be false):', hasTracks);

        console.log('\n--- Checking Target Companies & Gap ---');
        await sendEval(`window.location.hash = '#/target-gaps'`);
        await new Promise(r => setTimeout(r, 300));
        const tgText = await sendEval(`document.getElementById('view-target-gaps').innerText`);
        const hasRankedTargets = tgText.includes('Ranked Targets');
        const has4Configured = tgText.includes('4 Configured');
        const hasSortMatch = tgText.includes('Sort: Match Score');
        const hasAllTiers = tgText.includes('All Tiers');
        const hasTargetBar = tgText.includes('Target Bar (90th');
        const hasCandidateCurrent = tgText.includes('Candidate Current');
        const hasComparativeReadiness = tgText.includes('Comparative readiness vs Verified Hired');
        const hasDecisionTelemetry = tgText.includes('Decision Telemetry');
        const hasProofpointGapEngine = tgText.includes('Proofpoint Cohort Gap Engine');
        console.log('Has "Ranked Targets 4 Configured" (should be false):', hasRankedTargets || has4Configured);
        console.log('Has "Sort: Match Score" (should be false):', hasSortMatch);
        console.log('Has "All Tiers box" (should be false):', hasAllTiers);
        console.log('Has "Target Bar (90th %ile)" (should be false):', hasTargetBar);
        console.log('Has "Candidate Current" (should be false):', hasCandidateCurrent);
        console.log('Has "Comparative readiness" (should be false):', hasComparativeReadiness);
        console.log('Has "Decision Telemetry / Gap Engine" (should be false):', hasDecisionTelemetry || hasProofpointGapEngine);

        console.log('\n--- Checking Mock Drive Reports ---');
        await sendEval(`window.location.hash = '#/mock-reports'`);
        await new Promise(r => setTimeout(r, 300));
        const mrText = await sendEval(`document.getElementById('view-mock-reports').innerText`);
        const hasRunId = mrText.includes('RUN #2024-DRV-0842');
        const hasConducted = mrText.includes('Conducted Oct 24, 2024');
        const rightAlignedPills = await sendEval(`!!document.querySelector('#view-mock-reports .justify-end.ml-auto')`);
        console.log('Has RUN #2024-DRV-0842 (should be false):', hasRunId);
        console.log('Has Conducted date (should be false):', hasConducted);
        console.log('Pills container has right alignment classes:', rightAlignedPills);

        console.log('\n--- Checking Learning Roadmap ---');
        await sendEval(`window.location.hash = '#/learning-path'`);
        await new Promise(r => setTimeout(r, 300));
        const lpText = await sendEval(`document.getElementById('view-learning-path').innerText`);
        const hasBreadcrumb = lpText.includes('Adaptive Remediation');
        const hasDiagnosticSynthesis = lpText.includes('AI Diagnostic Synthesis');
        const hasTargetSDE = lpText.includes('Target: SDE-1 / Backend Engineer');
        const hasOriginMock = lpText.includes('Origin: Proctored Mock Drive #4');
        const hasDeterministicSeq = lpText.includes('Deterministic sequence: every node requires');
        const hasLoopId = lpText.includes('Loop ID: #RM-2025-0941');
        const hasIntegrityProtocol = lpText.includes('Integrity Protocol');
        const paragraphWhite = await sendEval(`document.querySelector('#view-learning-path p.text-white') !== null`);
        const gainWhite = await sendEval(`document.querySelector('#view-learning-path .text-white.uppercase')?.textContent.includes('Projected Gain')`);
        console.log('Has Breadcrumbs (should be false):', hasBreadcrumb);
        console.log('Has AI Diagnostic Synthesis (should be false):', hasDiagnosticSynthesis);
        console.log('Has Target SDE-1 / Backend Engineer (should be false):', hasTargetSDE);
        console.log('Has Origin Mock Drive (should be false):', hasOriginMock);
        console.log('Has Deterministic sequence (should be false):', hasDeterministicSeq);
        console.log('Has Loop ID: #RM-2025-0941 (should be false):', hasLoopId);
        console.log('Has Integrity Protocol (should be false):', hasIntegrityProtocol);
        console.log('Adaptive path paragraph is white text:', paragraphWhite);
        console.log('Projected Gain is white text:', gainWhite);

        console.log('\n--- Checking Privacy & DPDP Policy ---');
        await sendEval(`window.location.hash = '#/privacy-consent'`);
        await new Promise(r => setTimeout(r, 300));
        const dpText = await sendEval(`document.getElementById('view-privacy-consent').innerText`);
        const hasStrictReadOnly = dpText.includes('Strict Read-Only Enforcement');
        const has4ActiveIngest = dpText.includes('4 Active Ingest Pipelines Authenticated');
        const hasDpBreadcrumb = dpText.includes('Data Governance & Consent');
        const hasOAuth = dpText.includes('OAuth 2.0 App');
        const hasGraphQL = dpText.includes('Public GraphQL');
        const hasBadges = dpText.includes('Public Badges');
        const hasStatSync = dpText.includes('Statutory Sync');
        const hasCondReady = dpText.includes('Conditional Ready');
        const hasRuleMatch = dpText.includes('99.1% Deterministic Rule Match');
        const hasDecisionProof = dpText.includes('Inspect Decision Proof');
        const hasWhitepaper = dpText.includes('Proofpoint Explainability Whitepaper');
        const hasFailedCutoff = dpText.includes('Failed Cutoff');
        const hasPolicyMatch = dpText.includes('100% Policy Match');
        const hasVectorCalib = dpText.includes('98.4% Vector Calibration');
        const hasVectorRubric = dpText.includes('View Vector Rubric');
        const hasHighFit = dpText.includes('High Fit');

        console.log('Has Strict Read-Only Enforcement (should be false):', hasStrictReadOnly);
        console.log('Has 4 Active Ingest Pipelines Authenticated (should be false):', has4ActiveIngest);
        console.log('Has Data Governance & Consent Breadcrumb (should be false):', hasDpBreadcrumb);
        console.log('Has OAuth 2.0 App (should be false):', hasOAuth);
        console.log('Has Public GraphQL (should be false):', hasGraphQL);
        console.log('Has Public Badges (should be false):', hasBadges);
        console.log('Has Statutory Sync (should be false):', hasStatSync);
        console.log('Has Conditional Ready (should be false):', hasCondReady);
        console.log('Has 99.1% Deterministic Rule Match (should be false):', hasRuleMatch);
        console.log('Has Inspect Decision Proof (should be false):', hasDecisionProof);
        console.log('Has Proofpoint Explainability Whitepaper (should be false):', hasWhitepaper);
        console.log('Has Failed Cutoff (should be false):', hasFailedCutoff);
        console.log('Has 100% Policy Match (should be false):', hasPolicyMatch);
        console.log('Has 98.4% Vector Calibration (should be false):', hasVectorCalib);
        console.log('Has View Vector Rubric (should be false):', hasVectorRubric);
        console.log('Has High Fit (should be false):', hasHighFit);

        console.log('\nTotal console errors captured:', consoleErrors.length);

        const allClean = !hasLiveIngest && hasUploadCert && !hasTracks &&
                         !hasRankedTargets && !has4Configured && !hasSortMatch && !hasAllTiers &&
                         !hasTargetBar && !hasCandidateCurrent && !hasComparativeReadiness &&
                         !hasDecisionTelemetry && !hasProofpointGapEngine &&
                         !hasRunId && !hasConducted && rightAlignedPills &&
                         !hasBreadcrumb && !hasDiagnosticSynthesis && !hasTargetSDE && !hasOriginMock &&
                         !hasDeterministicSeq && !hasLoopId && !hasIntegrityProtocol &&
                         paragraphWhite && gainWhite &&
                         !hasStrictReadOnly && !has4ActiveIngest && !hasDpBreadcrumb &&
                         !hasOAuth && !hasGraphQL && !hasBadges && !hasStatSync &&
                         !hasCondReady && !hasRuleMatch && !hasDecisionProof && !hasWhitepaper &&
                         !hasFailedCutoff && !hasPolicyMatch && !hasVectorCalib && !hasVectorRubric && !hasHighFit &&
                         consoleErrors.length === 0;

        console.log('\nALL 30+ ASSERTIONS PASSED:', allClean);

        ws.close();
        proc.kill();
        process.exit(allClean ? 0 : 1);
      };
    });
  });
}, 2000);
