process.chdir(require('path').resolve(__dirname, '..', '..'));
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=9231',
  'http://localhost:3000/'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get('http://127.0.0.1:9231/json', (res) => {
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

          console.log('--- Testing Initial Dean View (#/cohort-skills) ---');
          await sendEval(`window.location.hash = '#/cohort-skills'`);
          await new Promise(r => setTimeout(r, 300));

          let checkDean = await sendEval(`JSON.stringify((() => {
            const sec = document.getElementById('section-institutional');
            const div = document.getElementById('divider-institutional');
            const btn = document.getElementById('btnNewDrive');
            const label = document.getElementById('personaLabel');
            return {
              secFound: !!sec,
              secHidden: sec ? sec.classList.contains('hidden') : null,
              divHidden: div ? div.classList.contains('hidden') : null,
              btnHidden: btn ? btn.classList.contains('!hidden') : null,
              bodyInStudentView: document.body.classList.contains('in-student-view'),
              label: label ? label.textContent : null
            };
          })())`);
          console.log('Dean View Status:', checkDean);

          console.log('--- Testing Switch to Student Candidate View (#/skill-profile) ---');
          await sendEval(`window.location.hash = '#/skill-profile'`);
          await new Promise(r => setTimeout(r, 300));

          let checkStudent = await sendEval(`JSON.stringify((() => {
            const sec = document.getElementById('section-institutional');
            const div = document.getElementById('divider-institutional');
            const btn = document.getElementById('btnNewDrive');
            const label = document.getElementById('personaLabel');
            return {
              secFound: !!sec,
              secHidden: sec ? sec.classList.contains('hidden') : null,
              divHidden: div ? div.classList.contains('hidden') : null,
              btnHidden: btn ? btn.classList.contains('!hidden') : null,
              bodyInStudentView: document.body.classList.contains('in-student-view'),
              label: label ? label.textContent : null
            };
          })())`);
          console.log('Student View Status:', checkStudent);

          console.log('--- Testing Persona Switcher: switchPersona("dean") ---');
          await sendEval(`switchPersona('dean')`);
          await new Promise(r => setTimeout(r, 300));

          let checkAfterSwitchDean = await sendEval(`JSON.stringify((() => {
            const sec = document.getElementById('section-institutional');
            const div = document.getElementById('divider-institutional');
            const btn = document.getElementById('btnNewDrive');
            const label = document.getElementById('personaLabel');
            return {
              secHidden: sec ? sec.classList.contains('hidden') : null,
              divHidden: div ? div.classList.contains('hidden') : null,
              btnHidden: btn ? btn.classList.contains('!hidden') : null,
              bodyInStudentView: document.body.classList.contains('in-student-view'),
              label: label ? label.textContent : null
            };
          })())`);
          console.log('After switchPersona("dean"):', checkAfterSwitchDean);

          console.log('--- Testing Persona Switcher: switchPersona("student") ---');
          await sendEval(`switchPersona('student')`);
          await new Promise(r => setTimeout(r, 300));

          let checkAfterSwitchStudent = await sendEval(`JSON.stringify((() => {
            const sec = document.getElementById('section-institutional');
            const div = document.getElementById('divider-institutional');
            const btn = document.getElementById('btnNewDrive');
            const label = document.getElementById('personaLabel');
            return {
              secHidden: sec ? sec.classList.contains('hidden') : null,
              divHidden: div ? div.classList.contains('hidden') : null,
              btnHidden: btn ? btn.classList.contains('!hidden') : null,
              bodyInStudentView: document.body.classList.contains('in-student-view'),
              label: label ? label.textContent : null
            };
          })())`);
          console.log('After switchPersona("student"):', checkAfterSwitchStudent);

          console.log('--- Testing All Student Routes Hide Institutional & Ops ---');
          const studentRoutes = [
            'skill-profile',
            'target-gaps',
            'mock-reports',
            'learning-path',
            'my-drives',
            'privacy-consent'
          ];
          for (const route of studentRoutes) {
            await sendEval(`window.location.hash = '#/${route}'`);
            await new Promise(r => setTimeout(r, 100));
            let isHidden = await sendEval(`JSON.stringify((() => {
              const sec = document.getElementById('section-institutional');
              return sec ? sec.classList.contains('hidden') : false;
            })())`);
            console.log(`Route #${route} hides Institutional:`, isHidden);
          }

          console.log('--- Testing All Institutional Routes Show Institutional & Ops ---');
          const instRoutes = [
            'cohort-skills',
            'drive-management',
            'talent-discovery',
            'fairness-accreditation'
          ];
          for (const route of instRoutes) {
            await sendEval(`window.location.hash = '#/${route}'`);
            await new Promise(r => setTimeout(r, 100));
            let isHidden = await sendEval(`JSON.stringify((() => {
              const sec = document.getElementById('section-institutional');
              return sec ? sec.classList.contains('hidden') : false;
            })())`);
            console.log(`Route #${route} hides Institutional:`, isHidden);
          }

          ws.close();
          proc.kill();
          process.exit(0);
        };
      } catch (err) {
        console.error(err);
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);
