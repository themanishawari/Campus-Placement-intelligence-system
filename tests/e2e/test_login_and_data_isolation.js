process.chdir(require('path').resolve(__dirname, '..', '..'));
const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9227;
const args = [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  'http://localhost:3000/#/login'
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

          console.log('\n--- Phase 1: Checking Initial Login View (#/login) ---');
          await new Promise(r => setTimeout(r, 600));

          const loginViewVisible = await sendEval(`!document.getElementById('view-login').classList.contains('hidden')`);
          const headerHidden = await sendEval(`document.getElementById('masterHeader').classList.contains('hidden')`);
          const sidebarHidden = await sendEval(`document.getElementById('masterSidebar').classList.contains('hidden')`);
          console.log('Login View visible:', loginViewVisible);
          console.log('Master Header hidden:', headerHidden);
          console.log('Master Sidebar hidden:', sidebarHidden);

          console.log('\n--- Phase 2: Testing Login Page Controls & Button Mappings ---');
          // Verify removed elements from login page
          const bannerRemoved = await sendEval(`document.getElementById('role-context-banner') === null`);
          const samlRemoved = await sendEval(`!document.getElementById('view-login').innerHTML.includes('handleSamlSSO')`);
          const auditFootnoteRemoved = await sendEval(`!document.getElementById('view-login').innerText.includes('Audit Logging Enabled') && !document.getElementById('view-login').innerText.includes('ISO/IEC 27001')`);
          const multiSigRemoved = await sendEval(`!document.getElementById('view-login').innerText.includes('TPO Multi-Sig Key')`);
          const passwordTokenRemoved = await sendEval(`!document.getElementById('view-login').querySelector('label[for="user-password"], div:has(> #user-password), label:has(+ div #user-password)')?.innerText.includes('/ Token')`);
          console.log('Role context banner removed:', bannerRemoved);
          console.log('SAML button removed:', samlRemoved);
          console.log('Audit footnote removed:', auditFootnoteRemoved);
          console.log('Multi-sig key text removed:', multiSigRemoved);

          // Switch to TPO Admin tab
          await sendEval(`switchRole('tpo')`);
          const mfaVisible = await sendEval(`!document.getElementById('mfa-section').classList.contains('hidden')`);
          const userValTPO = await sendEval(`document.getElementById('user-identity').value`);
          console.log('MFA Section visible for TPO:', mfaVisible);
          console.log('TPO Identity prefill:', userValTPO);

          // Switch back to Student tab
          await sendEval(`switchRole('student')`);
          const mfaHidden = await sendEval(`document.getElementById('mfa-section').classList.contains('hidden')`);
          const userValStudent = await sendEval(`document.getElementById('user-identity').value`);
          console.log('MFA Section hidden for Student:', mfaHidden);
          console.log('Student Identity prefill:', userValStudent);

          // Test Password Toggle
          await sendEval(`togglePasswordVisibility()`);
          const pwdType1 = await sendEval(`document.getElementById('user-password').type`);
          await sendEval(`togglePasswordVisibility()`);
          const pwdType2 = await sendEval(`document.getElementById('user-password').type`);
          console.log('Password toggle (text -> password):', pwdType1, '->', pwdType2);

          // Test FIDO token
          await sendEval(`verifyFidoToken()`);
          const toastMsgFido = await sendEval(`document.getElementById('toastMessage').textContent`);
          console.log('FIDO verification toast:', toastMsgFido);

          // Test Help Desk modal
          await sendEval(`openLoginHelpDesk()`);
          const helpdeskOpen = await sendEval(`!document.getElementById('modal-helpdesk').classList.contains('hidden')`);
          console.log('Help Desk modal opened:', helpdeskOpen);
          await sendEval(`closeModal('modal-helpdesk')`);
          const helpdeskClosed = await sendEval(`document.getElementById('modal-helpdesk').classList.contains('hidden')`);
          console.log('Help Desk modal closed:', helpdeskClosed);

          console.log('\n--- Phase 3: Authenticating as Student (Ananya Sharma) & Enforcing Data Isolation ---');
          await sendEval(`handleLogin({ preventDefault: () => {} })`);
          await new Promise(r => setTimeout(r, 700));

          const hashAfterStudentLogin = await sendEval(`window.location.hash`);
          const studentProfileVisible = await sendEval(`!document.getElementById('view-skill-profile').classList.contains('hidden')`);
          const bodyHasStudentClass = await sendEval(`document.body.classList.contains('in-student-view')`);
          const instSectionHiddenForStudent = await sendEval(`document.getElementById('section-institutional').classList.contains('hidden')`);
          const btnNewDriveHiddenForStudent = await sendEval(`document.getElementById('btnNewDrive').classList.contains('!hidden')`);
          const studentSectionVisible = await sendEval(`!document.getElementById('section-student').classList.contains('hidden')`);
          const personaLabelStudent = await sendEval(`document.getElementById('personaLabel').textContent`);

          console.log('Current Route:', hashAfterStudentLogin);
          console.log('Student Profile View visible:', studentProfileVisible);
          console.log('Body in-student-view:', bodyHasStudentClass);
          console.log('Institutional & Ops section hidden from Student:', instSectionHiddenForStudent);
          console.log('+ New Drive button hidden from Student:', btnNewDriveHiddenForStudent);
          console.log('Student navigation section visible:', studentSectionVisible);
          console.log('Persona label:', personaLabelStudent);

          console.log('\n--- Phase 4: Strict Air-Gap Test (Student attempting to access Admin routes) ---');
          await sendEval(`window.location.hash = '#/cohort-skills'`);
          await new Promise(r => setTimeout(r, 200));
          const hashAfterAdminAttempt = await sendEval(`window.location.hash`);
          const toastBlockedAdmin = await sendEval(`document.getElementById('toastMessage').textContent`);
          console.log('Route after unauthorized Admin navigation attempt:', hashAfterAdminAttempt);
          console.log('Route guard alert message:', toastBlockedAdmin);

          console.log('\n--- Phase 5: Signing Out & Locking Session ---');
          await sendEval(`signOut()`);
          await new Promise(r => setTimeout(r, 200));
          const hashAfterSignOut = await sendEval(`window.location.hash`);
          const loginViewAfterSignOut = await sendEval(`!document.getElementById('view-login').classList.contains('hidden')`);
          const headerHiddenAfterSignOut = await sendEval(`document.getElementById('masterHeader').classList.contains('hidden')`);
          console.log('Route after Sign Out:', hashAfterSignOut);
          console.log('Login View visible:', loginViewAfterSignOut);
          console.log('Header hidden after Sign Out:', headerHiddenAfterSignOut);

          console.log('\n--- Phase 6: Authenticating as TPO Admin (Dr. Aris Vance) & Enforcing Data Isolation ---');
          await sendEval(`switchRole('tpo')`);
          await sendEval(`handleLogin({ preventDefault: () => {} })`);
          await new Promise(r => setTimeout(r, 700));

          const hashAfterAdminLogin = await sendEval(`window.location.hash`);
          const cohortSkillsVisible = await sendEval(`!document.getElementById('view-cohort-skills').classList.contains('hidden')`);
          const bodyHasAdminClass = await sendEval(`document.body.classList.contains('in-admin-view')`);
          const studentSectionHiddenForAdmin = await sendEval(`document.getElementById('section-student').classList.contains('hidden')`);
          const instSectionVisibleForAdmin = await sendEval(`!document.getElementById('section-institutional').classList.contains('hidden')`);
          const btnNewDriveVisibleForAdmin = await sendEval(`!document.getElementById('btnNewDrive').classList.contains('!hidden')`);
          const personaLabelAdmin = await sendEval(`document.getElementById('personaLabel').textContent`);

          console.log('Current Route:', hashAfterAdminLogin);
          console.log('Cohort Skills View visible:', cohortSkillsVisible);
          console.log('Body in-admin-view:', bodyHasAdminClass);
          console.log('Student section hidden from Admin:', studentSectionHiddenForAdmin);
          console.log('Institutional & Ops section visible to Admin:', instSectionVisibleForAdmin);
          console.log('+ New Drive button visible to Admin:', btnNewDriveVisibleForAdmin);
          console.log('Persona label:', personaLabelAdmin);

          console.log('\n--- Phase 7: Strict Air-Gap Test (Admin attempting to access Student personal routes) ---');
          await sendEval(`window.location.hash = '#/skill-profile'`);
          await new Promise(r => setTimeout(r, 200));
          const hashAfterStudentAttempt = await sendEval(`window.location.hash`);
          const toastBlockedStudent = await sendEval(`document.getElementById('toastMessage').textContent`);
          console.log('Route after unauthorized Student navigation attempt:', hashAfterStudentAttempt);
          console.log('Route guard alert message:', toastBlockedStudent);

          console.log('\n--- Phase 8: Console Errors Check ---');
          console.log('Total console errors captured:', consoleErrors.length);
          if (consoleErrors.length > 0) {
            console.error('Console errors:', consoleErrors);
          }

          ws.close();
          proc.kill();
          process.exit(consoleErrors.length === 0 ? 0 : 1);
        };
      } catch (err) {
        console.error('Test execution error:', err);
        proc.kill();
        process.exit(1);
      }
    });
  });
}, 2000);

