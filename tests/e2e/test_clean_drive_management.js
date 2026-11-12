const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9235;

console.log('\n--- Checking Clean Campus Drive Management View ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/drive-management'
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

        const checkResult = await sendEval(`
          (() => {
            const dm = document.getElementById('view-drive-management');
            if (!dm) return { error: 'view-drive-management not found' };

            const text = dm.innerText || '';

            // Check 1: Live Operational Engine removed
            const hasLiveOp = text.includes('Live Operational Engine');

            // Check 2: VESIT Season 2024-25 • Cycle-1 Active removed
            const hasCycle1 = text.includes('Cycle-1 Active');

            // Check 3: Run clash detection button has sync icon and no text
            const runBtn = document.getElementById('runEngineBtn');
            const runBtnText = runBtn ? runBtn.innerText.trim() : null;
            const runBtnIcon = runBtn ? runBtn.querySelector('.material-symbols-outlined')?.textContent.trim() : null;

            // Check 4: Export master roster button has download icon and no text
            const buttons = Array.from(dm.querySelectorAll('header, section, div')).flatMap(el => Array.from(el.querySelectorAll('button')));
            const exportBtn = buttons.find(b => b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'file_download');
            const exportBtnText = exportBtn ? exportBtn.innerText.trim() : null;

            // Check 5: Entire section in picture removed
            const hasCalendarTab = text.includes('Unified Clash-Free Calendar');
            const hasPipelineTab = text.includes('Drive List & Pipeline');
            const hasMatrixTab = text.includes('Slot Optimization Matrix');
            const hasLabGuard = text.includes('Lab Capacity Guard');

            // Check 6: AI parsed incoming recruiter MoUs... removed
            const hasMoUs = text.includes('AI parsed incoming recruiter MoUs');

            // Check 7: Autonomous NLP extraction • Human-In-The-Loop Approval removed
            const hasNLP = text.includes('Autonomous NLP extraction');

            // Check 8: Automated multi-tier corporate pipeline... removed
            const hasCorporatePipeline = text.includes('Automated multi-tier corporate pipeline');

            // Click interaction test for runBtn
            let clickWorked = false;
            if (runBtn) {
              runBtn.click();
              clickWorked = true;
            }

            return {
              hasLiveOp,
              hasCycle1,
              runBtnText,
              runBtnIcon,
              exportBtnText,
              hasCalendarTab,
              hasPipelineTab,
              hasMatrixTab,
              hasLabGuard,
              hasMoUs,
              hasNLP,
              hasCorporatePipeline,
              clickWorked
            };
          })()
        `);

        console.log('Has "Live Operational Engine" (should be false):', checkResult.hasLiveOp);
        console.log('Has "Cycle-1 Active" (should be false):', checkResult.hasCycle1);
        console.log('Run Engine button text (should be "sync" or "rotate_right"):', JSON.stringify(checkResult.runBtnText));
        console.log('Run Engine button icon (should be sync):', checkResult.runBtnIcon);
        console.log('Export button text (should be "file_download"):', JSON.stringify(checkResult.exportBtnText));
        console.log('Has "Unified Clash-Free Calendar" (should be false):', checkResult.hasCalendarTab);
        console.log('Has "Drive List & Pipeline" (should be false):', checkResult.hasPipelineTab);
        console.log('Has "Slot Optimization Matrix" (should be false):', checkResult.hasMatrixTab);
        console.log('Has "Lab Capacity Guard" (should be false):', checkResult.hasLabGuard);
        console.log('Has "AI parsed incoming recruiter MoUs" (should be false):', checkResult.hasMoUs);
        console.log('Has "Autonomous NLP extraction" (should be false):', checkResult.hasNLP);
        console.log('Has "Automated multi-tier corporate pipeline" (should be false):', checkResult.hasCorporatePipeline);
        console.log('Click on run engine button succeeded:', checkResult.clickWorked);

        console.log('\nTotal console errors captured:', consoleErrors.length);

        const allClean = !checkResult.hasLiveOp &&
                         !checkResult.hasCycle1 &&
                         (checkResult.runBtnText === 'sync' || checkResult.runBtnText === 'rotate_right') &&
                         checkResult.exportBtnText === 'file_download' &&
                         !checkResult.hasCalendarTab &&
                         !checkResult.hasPipelineTab &&
                         !checkResult.hasMatrixTab &&
                         !checkResult.hasLabGuard &&
                         !checkResult.hasMoUs &&
                         !checkResult.hasNLP &&
                         !checkResult.hasCorporatePipeline &&
                         consoleErrors.length === 0;

        console.log('\nAll checks passed:', allClean);

        ws.close();
        proc.kill();
        process.exit(allClean ? 0 : 1);
      };
    });
  });
}, 2000);

