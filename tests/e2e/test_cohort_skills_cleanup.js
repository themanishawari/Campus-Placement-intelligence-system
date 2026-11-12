const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9277;

console.log('\n--- Checking Cohort Skill Dashboard Cleanups ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/cohort-skills'
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

        await new Promise(r => setTimeout(r, 600));

        // Authenticate if needed or check view content directly
        const viewCohortSkills = await sendEval(`document.getElementById('view-cohort-skills')?.innerHTML`);
        const hasBreadcrumb = viewCohortSkills.includes('T&amp;P Admin Portal') || viewCohortSkills.includes('T&P Admin Portal');
        console.log('Has "T&P Admin Portal" breadcrumb (should be false):', hasBreadcrumb);

        const hasInstitutionalBreadcrumb = viewCohortSkills.includes('Institutional Analytics');
        console.log('Has "Institutional Analytics" in breadcrumbs (should be false):', hasInstitutionalBreadcrumb);

        const hasTitle = viewCohortSkills.includes('VESIT Cohort Skill Intelligence');
        console.log('Has Title "VESIT Cohort Skill Intelligence" (should be true):', hasTitle);

        console.log('\nTotal console errors:', consoleErrors.length);

        proc.kill();
        const success = !hasBreadcrumb && !hasInstitutionalBreadcrumb && hasTitle && consoleErrors.length === 0;
        console.log('\nTest passed:', success);
        process.exit(success ? 0 : 1);
      };
    });
  });
}, 1200);

