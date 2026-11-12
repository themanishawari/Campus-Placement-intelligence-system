process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9225',
  'http://localhost:3000/'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get('http://127.0.0.1:9225/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes('localhost:3000'));
        const ws = new WebSocket(appTab.webSocketDebuggerUrl);

        ws.onopen = async () => {
          ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

          const sendEval = (expr) => new Promise((resolve) => {
            const reqId = Math.floor(Math.random() * 100000);
            const handler = (m) => {
              const res = JSON.parse(m.data);
              if (res.id === reqId) {
                ws.removeEventListener('message', handler);
                resolve(res.result?.result?.value);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({
              id: reqId,
              method: 'Runtime.evaluate',
              params: { expression: expr, returnByValue: true }
            }));
          });

          const routes = [
            'cohort-skills',
            'drive-management',
            'talent-discovery',
            'fairness-accreditation',
            'skill-profile',
            'target-gaps',
            'mock-reports',
            'learning-path',
            'my-drives',
            'privacy-consent'
          ];

          for (const r of routes) {
            await sendEval(`window.location.hash = '#/${r}'`);
            await new Promise(res => setTimeout(res, 100));
            const check = await sendEval(`
              (() => {
                const panel = document.getElementById('view-${r}');
                return panel && !panel.classList.contains('hidden');
              })()
            `);
            console.log(`Route #${r} is visible:`, check);
          }

          await sendEval(`openModal('modal-omnisearch')`);
          const modalOpen = await sendEval(`!document.getElementById('modal-omnisearch').classList.contains('hidden')`);
          console.log('OmniSearch Modal opened:', modalOpen);

          await sendEval(`closeModal('modal-omnisearch')`);
          const modalClosed = await sendEval(`document.getElementById('modal-omnisearch').classList.contains('hidden')`);
          console.log('OmniSearch Modal closed:', modalClosed);

          ws.close();
          proc.kill();
          process.exit(0);
        };
      } catch (err) {
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);
