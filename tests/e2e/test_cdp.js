process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9222',
  'http://localhost:3000/'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        console.log('Edge tabs loaded via CDP:', tabs.length);
        if (tabs.length > 0) {
          console.log('Tab title:', tabs[0].title);
          console.log('Tab URL:', tabs[0].url);
        }
      } catch (e) {
        console.error('JSON parse error:', e.message);
      }
      proc.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('HTTP error connecting to CDP:', err.message);
    proc.kill();
    process.exit(1);
  });
}, 2000);
