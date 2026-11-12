process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9224',
  'http://localhost:3000/'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get('http://127.0.0.1:9224/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes('localhost:3000'));
        if (!appTab) {
          console.error('App tab not found.');
          proc.kill();
          process.exit(1);
        }

        const ws = new WebSocket(appTab.webSocketDebuggerUrl);
        const errors = [];
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

        ws.onopen = async () => {
          ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

          const sendEval = (expr) => new Promise((resolve) => {
            const reqId = Math.floor(Math.random() * 100000);
            const handler = (m) => {
              const res = JSON.parse(m.data);
              if (res.id === reqId) {
                ws.removeEventListener('message', handler);
                resolve(res.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({
              id: reqId,
              method: 'Runtime.evaluate',
              params: { expression: expr, returnByValue: true }
            }));
          });

          // Test routing to each route
          for (const r of routes) {
            await sendEval(`window.location.hash = '#/${r}'`);
            await new Promise(res => setTimeout(res, 200));
            const check = await sendEval(`
              (() => {
                const panel = document.getElementById('view-${r}');
                return {
                  exists: !!panel,
                  visible: panel ? !panel.classList.contains('hidden') : false
                };
              })()
            `);
            console.log(`Route #${r} -> panel check:`, check?.value);
          }

          // Test opening and closing a modal
          await sendEval(`openModal('modal-omnisearch')`);
          const modalCheck = await sendEval(`!document.getElementById('modal-omnisearch').classList.contains('hidden')`);
          console.log('OmniSearch modal opened successfully:', modalCheck?.value);

          await sendEval(`closeModal('modal-omnisearch')`);
          const modalClosed = await sendEval(`document.getElementById('modal-omnisearch').classList.contains('hidden')`);
          console.log('OmniSearch modal closed successfully:', modalClosed?.value);

          // Test toast notification
          await sendEval(`showToast('Comprehensive E2E Verification Passed!', 'verified')`);
          const toastCheck = await sendEval(`document.getElementById('toastNotification').classList.contains('opacity-100')`);
          console.log('Toast triggered successfully:', toastCheck?.value);

          console.log('\n--- VERIFICATION SUMMARY ---');
          console.log('Errors caught during full E2E navigation:', errors.length);
          ws.close();
          proc.kill();
          process.exit(errors.length > 0 ? 1 : 0);
        };

        ws.onmessage = (msg) => {
          const payload = JSON.parse(msg.data);
          if (payload.method === 'Runtime.exceptionThrown') {
            errors.push(payload.params.exceptionDetails.text);
          }
        };

      } catch (err) {
        console.error('Test error:', err);
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);
