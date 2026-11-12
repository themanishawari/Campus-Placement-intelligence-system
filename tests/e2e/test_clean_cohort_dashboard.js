process.chdir(require('path').resolve(__dirname, '..', '..'));
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9228;
const args = [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  'http://localhost:3000/#/cohort-skills'
];

const proc = spawn(edgePath, args);

setTimeout(() => {
  http.get(`http://127.0.0.1:${port}/json`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes('localhost:3000'));
        if (!appTab) {
          console.error('No app tab found');
          proc.kill();
          process.exit(1);
        }

        const ws = new WebSocket(appTab.webSocketDebuggerUrl);

        ws.onopen = async () => {
          ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

          const consoleErrors = [];
          ws.addEventListener('message', (m) => {
            const msg = JSON.parse(m.data);
            if (msg.method === 'Console.messageAdded' && msg.params?.message?.level === 'error') {
              consoleErrors.push(msg.params.message.text);
            }
          });

          const sendEval = (expr) => new Promise((resolve, reject) => {
            const reqId = Math.floor(Math.random() * 1000000);
            const handler = (m) => {
              const res = JSON.parse(m.data);
              if (res.id === reqId) {
                ws.removeEventListener('message', handler);
                if (res.result?.exceptionDetails) {
                  reject(res.result.exceptionDetails);
                } else {
                  resolve(res.result?.result?.value);
                }
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({
              id: reqId,
              method: 'Runtime.evaluate',
              params: { expression: expr, returnByValue: true, awaitPromise: true }
            }));
          });

          await new Promise(r => setTimeout(r, 600));

          console.log('\n--- Checking Clean Cohort Skill Dashboard ---');

          // 1. Check Rescan Button
          const rescanBtnExists = await sendEval(`!!document.getElementById('rescanTriggerBtn')`);
          const rescanTextExists = await sendEval(`!!document.getElementById('rescanText')`);
          const rescanIconExists = await sendEval(`!!document.getElementById('rescanIcon')`);
          const rescanBtnContent = await sendEval(`document.getElementById('rescanTriggerBtn').textContent.trim()`);
          console.log('Rescan button exists:', rescanBtnExists);
          console.log('Rescan icon exists:', rescanIconExists);
          console.log('Rescan text span exists:', rescanTextExists);
          console.log('Rescan button text content (should only be sync icon):', JSON.stringify(rescanBtnContent));

          // Test clicking rescan button
          await sendEval(`document.getElementById('rescanTriggerBtn').click()`);
          await new Promise(r => setTimeout(r, 500));
          const toastAfterRescan = await sendEval(`document.getElementById('toastNotification')?.textContent || ''`);
          console.log('Rescan button click succeeded without error:', true);

          // 2. Check Tenant Isolation Banner
          const cohortHtml = await sendEval(`document.getElementById('view-cohort-skills').innerHTML`);
          const hasTenantIsolation = cohortHtml.includes('Tenant Isolation:');
          console.log('Has Tenant Isolation text (should be false):', hasTenantIsolation);

          // 3. Check KPI card boxes
          const hasLiveAstAudit = cohortHtml.includes('Live AST Audit');
          const hasProofEngine = cohortHtml.includes('Proof-Engine');
          const hasPolicyEngine = cohortHtml.includes('Policy Engine');
          const hasTMinus6 = cohortHtml.includes('T-minus 6 Months Early Alarm');
          const hasQ4JDs = cohortHtml.includes('Q4 JDs Analyzed');
          console.log('Has "Live AST Audit" tag (should be false):', hasLiveAstAudit);
          console.log('Has "Proof-Engine" tag (should be false):', hasProofEngine);
          console.log('Has "Policy Engine" tag (should be false):', hasPolicyEngine);
          console.log('Has "T-minus 6 Months Early Alarm" (should be false):', hasTMinus6);
          console.log('Has "Q4 JDs Analyzed" (should be false):', hasQ4JDs);

          // 4. Check Supervised AST Audit Stream section
          const hasAuditStream = cohortHtml.includes('Supervised AST Audit Stream');
          console.log('Has "Supervised AST Audit Stream" section (should be false):', hasAuditStream);

          // 5. Console errors check
          console.log('\nTotal console errors captured:', consoleErrors.length);
          if (consoleErrors.length > 0) {
            console.error('Console errors:', consoleErrors);
          }

          ws.close();
          proc.kill();

          const allPassed = rescanBtnExists && 
            !rescanTextExists && 
            !hasTenantIsolation && 
            !hasLiveAstAudit && 
            !hasProofEngine && 
            !hasAuditStream && 
            consoleErrors.length === 0;

          console.log('\nAll checks passed:', allPassed);
          process.exit(allPassed ? 0 : 1);
        };
      } catch (err) {
        console.error('Test execution error:', err);
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);

