const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9240;

console.log('\n--- Checking Talent Discovery & Rules Page ---');

const proc = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--window-size=1440,900',
  '--remote-debugging-port=' + port,
  'http://localhost:3000/#/talent-discovery'
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
            const td = document.getElementById('view-talent-discovery');
            if (!td) return { error: 'view-talent-discovery not found' };

            const text = td.innerText || '';

            // 1. Text phrase checks
            const hasAstRulesetEngine = text.includes('Deterministic AST Ruleset Engine');
            const hasAstEngineOnline = text.includes('AST Engine: Online');
            const hasReproducibleAppealable = text.includes('Reproducible & Appealable');
            const hasSha256Chain = text.includes('Tamper-Evident SHA-256 Chain');
            const hasDeterministicExecution = text.includes('Deterministic execution triggered across active cohort');

            // 2. Element geometry and classes
            const paneLeft = document.getElementById('paneLeft');
            const paneRight = document.getElementById('paneRight');
            const ruleHistory = document.getElementById('ruleVersionHistorySection');
            const workspaceGrid = document.getElementById('workspaceGrid');

            const paneLeftRect = paneLeft ? paneLeft.getBoundingClientRect() : null;
            const paneRightRect = paneRight ? paneRight.getBoundingClientRect() : null;
            const ruleHistoryRect = ruleHistory ? ruleHistory.getBoundingClientRect() : null;
            const workspaceGridRect = workspaceGrid ? workspaceGrid.getBoundingClientRect() : null;

            return {
              hasAstRulesetEngine,
              hasAstEngineOnline,
              hasReproducibleAppealable,
              hasSha256Chain,
              hasDeterministicExecution,
              paneLeftClass: paneLeft ? paneLeft.className : null,
              paneRightClass: paneRight ? paneRight.className : null,
              ruleHistoryClass: ruleHistory ? ruleHistory.className : null,
              paneLeftRect: paneLeftRect ? { left: paneLeftRect.left, width: paneLeftRect.width, right: paneLeftRect.right, bottom: paneLeftRect.bottom } : null,
              paneRightRect: paneRightRect ? { left: paneRightRect.left, width: paneRightRect.width, right: paneRightRect.right, bottom: paneRightRect.bottom } : null,
              ruleHistoryRect: ruleHistoryRect ? { left: ruleHistoryRect.left, top: ruleHistoryRect.top, width: ruleHistoryRect.width, right: ruleHistoryRect.right } : null,
              workspaceGridRect: workspaceGridRect ? { left: workspaceGridRect.left, width: workspaceGridRect.width, right: workspaceGridRect.right } : null
            };
          })()
        `);

        console.log('Has "Deterministic AST Ruleset Engine" (should be false):', result.hasAstRulesetEngine);
        console.log('Has "AST Engine: Online" (should be false):', result.hasAstEngineOnline);
        console.log('Has "Reproducible & Appealable" (should be false):', result.hasReproducibleAppealable);
        console.log('Has "Tamper-Evident SHA-256 Chain" (should be false):', result.hasSha256Chain);
        console.log('Has "Deterministic execution triggered..." (should be false):', result.hasDeterministicExecution);
        console.log('\nPane Left class:', result.paneLeftClass);
        console.log('Pane Right class:', result.paneRightClass);
        console.log('Rule History class:', result.ruleHistoryClass);
        console.log('Pane Left rect:', result.paneLeftRect);
        console.log('Pane Right rect:', result.paneRightRect);
        console.log('Rule History rect:', result.ruleHistoryRect);
        console.log('Workspace Grid rect:', result.workspaceGridRect);

        const leftColReduced = result.paneLeftClass.includes('xl:col-span-4');
        const rightColExpanded = result.paneRightClass.includes('xl:col-span-8');
        const ruleHistoryFullWidth = result.ruleHistoryClass.includes('w-full') &&
                                     result.ruleHistoryRect &&
                                     result.workspaceGridRect &&
                                     Math.abs(result.ruleHistoryRect.width - result.workspaceGridRect.width) < 5;

        const ruleHistoryAtBottom = result.ruleHistoryRect &&
                                    result.paneLeftRect &&
                                    result.paneRightRect &&
                                    result.ruleHistoryRect.top >= Math.min(result.paneLeftRect.bottom, result.paneRightRect.bottom);

        console.log('\nLeft column reduced (xl:col-span-4):', leftColReduced);
        console.log('Right column expanded (xl:col-span-8):', rightColExpanded);
        console.log('Rule History spans full width:', ruleHistoryFullWidth);
        console.log('Rule History positioned at bottom:', ruleHistoryAtBottom);
        console.log('Console errors captured:', consoleErrors.length);

        const allPassed = !result.hasAstRulesetEngine &&
                          !result.hasAstEngineOnline &&
                          !result.hasReproducibleAppealable &&
                          !result.hasSha256Chain &&
                          !result.hasDeterministicExecution &&
                          leftColReduced &&
                          rightColExpanded &&
                          ruleHistoryFullWidth &&
                          ruleHistoryAtBottom &&
                          consoleErrors.length === 0;

        console.log('\nAll checks passed:', allPassed);

        ws.close();
        proc.kill();
        process.exit(allPassed ? 0 : 1);
      };
    });
  });
}, 2000);
