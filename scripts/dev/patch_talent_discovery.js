process.chdir(require('path').resolve(__dirname, '..', '..')); // run from project root regardless of cwd
const fs = require('fs');

let content = fs.readFileSync('src/views/talent-discovery.html', 'utf8');

// Add view switcher toolbar and id="paneLeft"
const target1 = `<!-- Primary Workspace Canvas (Dual Pane Split Grid 5:7) -->
<div class="p-8">
<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" id="workspaceGrid">
<!-- ========================================================================= -->
<!-- SECTION 1: LEFT PANE - DECLARATIVE ELIGIBILITY ENGINE (5 cols)           -->
<!-- ========================================================================= -->
<section class="xl:col-span-5 flex flex-col gap-6">`;

const replacement1 = `<!-- View Switcher Toolbar -->
<div class="px-8 pt-4 flex items-center justify-between">
  <div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg border border-slate-200">
    <button id="viewDualBtn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-sm transition-all">
      <span class="material-symbols-outlined text-sm">view_column</span>
      <span>Dual Split (5:7)</span>
    </button>
    <button id="viewRuleBtn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all">
      <span class="material-symbols-outlined text-sm">rule_settings</span>
      <span>Rule Engine Only</span>
    </button>
    <button id="viewRecruiterBtn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all">
      <span class="material-symbols-outlined text-sm">group</span>
      <span>Talent Roster Only</span>
    </button>
  </div>
  <div class="text-xs text-slate-500 font-mono hidden md:block">
    Dynamic Workspace Mode
  </div>
</div>
<!-- Primary Workspace Canvas (Dual Pane Split Grid 5:7) -->
<div class="p-8">
<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" id="workspaceGrid">
<!-- ========================================================================= -->
<!-- SECTION 1: LEFT PANE - DECLARATIVE ELIGIBILITY ENGINE (5 cols)           -->
<!-- ========================================================================= -->
<section id="paneLeft" class="xl:col-span-5 flex flex-col gap-6">`;

content = content.replace(/\r\n/g, '\n');
const targetNorm = target1.replace(/\r\n/g, '\n');
if (content.includes(targetNorm)) {
  content = content.replace(targetNorm, replacement1.replace(/\r\n/g, '\n'));
  console.log('Successfully added toolbar and paneLeft ID!');
} else {
  console.error('Target 1 not found!');
}

// Add id="paneRight"
const target2 = `<!-- ========================================================================= -->
<!-- SECTION 2: RIGHT PANE - RECRUITER TALENT DISCOVERY (7 cols)               -->
<!-- ========================================================================= -->
<section class="xl:col-span-7 flex flex-col gap-6">`;

const replacement2 = `<!-- ========================================================================= -->
<!-- SECTION 2: RIGHT PANE - RECRUITER TALENT DISCOVERY (7 cols)               -->
<!-- ========================================================================= -->
<section id="paneRight" class="xl:col-span-7 flex flex-col gap-6">`;

const target2Norm = target2.replace(/\r\n/g, '\n');
if (content.includes(target2Norm)) {
  content = content.replace(target2Norm, replacement2.replace(/\r\n/g, '\n'));
  console.log('Successfully added paneRight ID!');
} else {
  console.error('Target 2 not found!');
}

// Ensure script is properly guarded
const scriptTarget = `  viewDualBtn.addEventListener('click', () => {`;
const scriptReplacement = `  if (viewDualBtn && paneLeft && paneRight) {
  viewDualBtn.addEventListener('click', () => {`;

if (content.includes(scriptTarget)) {
  content = content.replace(scriptTarget, scriptReplacement);
  // close the if block at end of viewRecruiterBtn listener
  content = content.replace(`paneRight.className = "xl:col-span-12 flex flex-col gap-6";\n  });`, `paneRight.className = "xl:col-span-12 flex flex-col gap-6";\n  });\n  }`);
  console.log('Successfully guarded script block in talent-discovery!');
}

fs.writeFileSync('src/views/talent-discovery.html', content, 'utf8');
console.log('Saved src/views/talent-discovery.html successfully.');
