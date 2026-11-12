const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9288;

console.log('\n--- Checking Arial Font Replacement across the Application ---');

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

        await new Promise(r => setTimeout(r, 800));

        // Evaluate computed font-family on elements that previously used JetBrains Mono
        const fontChecks = await sendEval(`
          (() => {
            const results = {};
            
            // Check elements with .font-mono
            const monoEls = Array.from(document.querySelectorAll('.font-mono'));
            const monoFonts = [...new Set(monoEls.map(el => window.getComputedStyle(el).fontFamily))];
            results.monoFonts = monoFonts;
            
            // Check elements with .font-label-sm
            const labelSmEls = Array.from(document.querySelectorAll('.font-label-sm'));
            const labelSmFonts = [...new Set(labelSmEls.map(el => window.getComputedStyle(el).fontFamily))];
            results.labelSmFonts = labelSmFonts;

            // Check elements with .font-label-code
            const labelCodeEls = Array.from(document.querySelectorAll('.font-label-code'));
            const labelCodeFonts = [...new Set(labelCodeEls.map(el => window.getComputedStyle(el).fontFamily))];
            results.labelCodeFonts = labelCodeFonts;

            // Check code elements
            const codeEls = Array.from(document.querySelectorAll('code'));
            const codeFonts = [...new Set(codeEls.map(el => window.getComputedStyle(el).fontFamily))];
            results.codeFonts = codeFonts;

            // Verify that no element computed font includes "JetBrains Mono"
            const allElements = Array.from(document.querySelectorAll('*'));
            const jetbrainsUsed = allElements.some(el => {
              const ff = window.getComputedStyle(el).fontFamily;
              return ff && ff.toLowerCase().includes('jetbrains');
            });
            results.hasJetBrains = jetbrainsUsed;

            return results;
          })()
        `);

        console.log('Computed fonts for .font-mono:', fontChecks.monoFonts);
        console.log('Computed fonts for .font-label-sm:', fontChecks.labelSmFonts);
        console.log('Computed fonts for .font-label-code:', fontChecks.labelCodeFonts);
        console.log('Computed fonts for <code> elements:', fontChecks.codeFonts);
        console.log('Any element still using JetBrains Mono (should be false):', fontChecks.hasJetBrains);
        console.log('Total console errors:', consoleErrors.length);

        const allArial = (
          fontChecks.monoFonts.every(f => f.toLowerCase().includes('arial')) &&
          fontChecks.labelCodeFonts.every(f => f.toLowerCase().includes('arial')) &&
          !fontChecks.hasJetBrains &&
          consoleErrors.length === 0
        );

        console.log('\nAll Arial verification passed:', allArial);

        proc.kill();
        process.exit(allArial ? 0 : 1);
      };
    });
  });
}, 1500);
