const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9250;

console.log('\n--- Checking Clean Sidebar in Admin and Student Views ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/cohort-skills'
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
            const sidebar = document.getElementById('masterSidebar');
            if (!sidebar) return { error: 'masterSidebar not found' };

            const text = sidebar.innerText;

            // Check for previous small box badge texts
            const badgesFound = [
              '81.4%',
              '3 Active',
              '142 Pool',
              'NAAC 5.2',
              'Verified',
              '4 Targets',
              '92% High',
              'Sprint 2',
              '4 Applied',
              'DPDP ✓',
              'TPO',
              'Ananya S.'
            ].filter(b => text.includes(b));

            // Check for any spans inside nav links with rounded bg
            const navLinks = Array.from(sidebar.querySelectorAll('.nav-item'));
            const spansInsideNav = navLinks.flatMap(a => Array.from(a.querySelectorAll('span.rounded, span[class*="bg-"]')));

            return {
              badgesFound,
              spansCount: spansInsideNav.length,
              totalNavLinks: navLinks.length
            };
          })()
        `);

        console.log('Badges found in sidebar (should be empty):', result.badgesFound);
        console.log('Spans with background inside nav items (should be 0):', result.spansCount);
        console.log('Total nav links found:', result.totalNavLinks);
        console.log('Console errors captured:', consoleErrors.length);

        const allClean = result.badgesFound.length === 0 &&
                         result.spansCount === 0 &&
                         result.totalNavLinks === 10 &&
                         consoleErrors.length === 0;

        console.log('\nAll checks passed:', allClean);

        ws.close();
        proc.kill();
        process.exit(allClean ? 0 : 1);
      };
    });
  });
}, 2000);
