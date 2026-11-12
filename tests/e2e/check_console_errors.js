process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9223',
  'http://localhost:3000/'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get('http://127.0.0.1:9223/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes('localhost:3000'));
        if (!appTab) {
          console.log('App tab not found. Tabs:', tabs.map(t => t.url));
          proc.kill();
          process.exit(0);
        }

        console.log('Connecting WebSocket to app tab:', appTab.title);
        const ws = new WebSocket(appTab.webSocketDebuggerUrl);
        const errors = [];
        const logs = [];

        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
          
          setTimeout(() => {
            console.log('Total console errors caught:', errors.length);
            errors.forEach(e => console.log('  ERROR:', e));
            console.log('Sample console logs:', logs.slice(0, 5));
            ws.close();
            proc.kill();
            process.exit(errors.length > 0 ? 1 : 0);
          }, 2500);
        };

        ws.onmessage = (msg) => {
          const payload = JSON.parse(msg.data);
          if (payload.method === 'Runtime.exceptionThrown') {
            errors.push(payload.params.exceptionDetails.text + ' ' + (payload.params.exceptionDetails.exception?.description || ''));
          } else if (payload.method === 'Console.messageAdded') {
            if (payload.params.message.level === 'error') {
              errors.push(payload.params.message.text);
            } else {
              logs.push(payload.params.message.text);
            }
          }
        };

        ws.onerror = (err) => {
          console.error('WS Error:', err);
          proc.kill();
          process.exit(1);
        };

      } catch (e) {
        console.error('Error:', e.message);
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);
