const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9255;

console.log('\n--- Checking My Drives and Eligibility View Cleanups ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/my-drives'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:' + port + '/json', res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', async () => {
      const tabs = JSON.parse(d);
      const appTab = tabs.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
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

        await new Promise(r => setTimeout(r, 1200));

        // Ensure we navigate to view-my-drives if not already
        await sendEval(`(() => {
          if (typeof navigateTo === 'function') navigateTo('my-drives');
          else window.location.hash = '#/my-drives';
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // Check 1: Header removal
        const viewText = await sendEval(`document.getElementById('view-my-drives')?.innerText || ''`);
        const hasHeaderBreadcrumb = viewText.includes('Eligibility Verification Engine') || viewText.includes('Proofpoint Placement Intelligence');
        console.log('Has "Proofpoint Placement Intelligence / Eligibility Verification Engine" (should be false):', hasHeaderBreadcrumb);

        // Check 2: Trace Ref removed from KPI cards
        const hasTraceRef = viewText.includes('Trace Ref:');
        console.log('Has "Trace Ref" in KPI cards (should be false):', hasTraceRef);

        // Check 3: "Start 20m Lab Validation" removed
        const has20mLab = viewText.includes('Start 20m Lab Validation');
        console.log('Has "Start 20m Lab Validation" (should be false):', has20mLab);

        // Check 4: Badges neatly aligned inside each card
        const badgesNeat = await sendEval(`
          (() => {
            const cards = Array.from(document.querySelectorAll('#drives-grid .drive-card'));
            return cards.every(c => {
              const badge = c.querySelector('.rounded-full.font-bold');
              return badge && badge.classList.contains('shrink-0') && badge.classList.contains('whitespace-nowrap');
            });
          })()
        `);
        console.log('Eligible/not-eligible badges neatly fitted in cards:', badgesNeat);

        // Check 5: Kanban mode (default) hides table view
        const initialKanbanGridVisible = await sendEval(`!document.getElementById('drives-grid').classList.contains('hidden')`);
        const initialTableHidden = await sendEval(`document.getElementById('table-view-section').classList.contains('hidden')`);
        console.log('Initial state: Kanban grid visible:', initialKanbanGridVisible);
        console.log('Initial state: Table section hidden:', initialTableHidden);

        // Check 6: Switch to Detailed Table mode hides cards, shows table
        await sendEval(`document.getElementById('view-table-btn').click()`);
        await new Promise(r => setTimeout(r, 200));
        const tableModeGridHidden = await sendEval(`document.getElementById('drives-grid').classList.contains('hidden')`);
        const tableModeTableVisible = await sendEval(`!document.getElementById('table-view-section').classList.contains('hidden')`);
        console.log('Detailed Table mode: KPI cards hidden:', tableModeGridHidden);
        console.log('Detailed Table mode: Table section visible:', tableModeTableVisible);

        // Check 7: Switch back to Kanban Board mode shows cards, hides table
        await sendEval(`document.getElementById('view-kanban-btn').click()`);
        await new Promise(r => setTimeout(r, 200));
        const returnKanbanGridVisible = await sendEval(`!document.getElementById('drives-grid').classList.contains('hidden')`);
        const returnTableHidden = await sendEval(`document.getElementById('table-view-section').classList.contains('hidden')`);
        console.log('Back to Kanban mode: KPI cards visible:', returnKanbanGridVisible);
        console.log('Back to Kanban mode: Table section hidden:', returnTableHidden);

        console.log('\nTotal console errors captured:', consoleErrors.length);

        const allPassed = !hasHeaderBreadcrumb &&
                          !hasTraceRef &&
                          !has20mLab &&
                          badgesNeat &&
                          initialKanbanGridVisible &&
                          initialTableHidden &&
                          tableModeGridHidden &&
                          tableModeTableVisible &&
                          returnKanbanGridVisible &&
                          returnTableHidden &&
                          consoleErrors.length === 0;

        console.log('\nAll checks passed:', allPassed);

        ws.close();
        proc.kill();
        process.exit(allPassed ? 0 : 1);
      };
    });
  });
}, 2000);

