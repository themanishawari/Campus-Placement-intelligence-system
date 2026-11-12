process.chdir(require('path').resolve(__dirname, '..')); // run from project root regardless of cwd
const fs = require('fs');
const path = require('path');

// Load master Tailwind config
const masterTwConfig = JSON.parse(fs.readFileSync('config/tailwind.config.json', 'utf8'));

// Load all views including Login
const views = [
  { id: 'login', file: 'login.html', title: 'Proofpoint Multi-Tenant Portal Access', group: 'auth' },
  { id: 'cohort-skills', file: 'cohort-skills.html', title: 'VESIT Cohort Skill Intelligence', group: 'institutional' },
  { id: 'drive-management', file: 'drive-management.html', title: 'Campus Drive Management & Scheduling', group: 'institutional' },
  { id: 'talent-discovery', file: 'talent-discovery.html', title: 'Institutional Eligibility & Talent Discovery', group: 'institutional' },
  { id: 'fairness-accreditation', file: 'fairness-accreditation.html', title: 'Fairness Check & Statutory Accreditation', group: 'institutional' },
  { id: 'skill-profile', file: 'skill-profile.html', title: 'Student Skill Profile - Ananya Sharma', group: 'student' },
  { id: 'target-gaps', file: 'target-gaps.html', title: 'Target Companies & Proofpoint Gap Matrix', group: 'student' },
  { id: 'mock-reports', file: 'mock-reports.html', title: 'Mock Drive Performance Diagnostics', group: 'student' },
  { id: 'learning-path', file: 'learning-path.html', title: 'Personal Learning Path & Remediation', group: 'student' },
  { id: 'my-drives', file: 'my-drives.html', title: 'My Drives & Institutional Eligibility', group: 'student' },
  { id: 'privacy-consent', file: 'privacy-consent.html', title: 'My Privacy, Consent & DPDP Policy', group: 'student' }
];

const viewHtmlMap = {};
views.forEach(v => {
  const content = fs.readFileSync(path.join('src/views', v.file), 'utf8');
  viewHtmlMap[v.id] = content;
});

// Build Master Header HTML
const masterHeader = `
<header id="masterHeader" class="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
  <!-- Brand & Institutional Identifier Left -->
  <div class="flex items-center gap-3 lg:gap-6 shrink-0">
    <!-- Proofpoint Brand Logo -->
    <a href="#/cohort-skills" id="headerBrandLink" class="flex items-center gap-2.5 group">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-navy via-slate-900 to-blue-900 text-on-primary flex items-center justify-center font-headline-md text-headline-md tracking-tight font-bold shadow-sm shadow-blue-900/30 group-hover:scale-105 transition-transform">
        P
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="font-headline-md text-headline-md text-on-surface tracking-tight leading-none font-bold">Proofpoint</span>
          <span class="px-1.5 py-0.2 rounded bg-primary-container text-primary-fixed font-label-sm text-[10px] font-semibold tracking-wider">v5.4</span>
        </div>
        <span class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Placement Intel</span>
      </div>
    </a>

    <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

    <!-- Institutional Tenant Badge -->
    <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low border border-slate-200 text-on-surface text-xs">
      <span class="material-symbols-outlined text-[15px] text-secondary">school</span>
      <span class="font-semibold text-slate-800 truncate max-w-[200px] lg:max-w-[280px]">VESIT Mumbai (Autonomous)</span>
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Real-time Node Connected"></span>
    </div>
  </div>

  <!-- Center: OmniSearch Search Bar (Ctrl+K) -->
  <div class="flex-1 max-w-lg mx-3 lg:mx-6 hidden md:block">
    <div class="relative flex items-center">
      <span class="material-symbols-outlined absolute left-3 text-slate-400 text-lg pointer-events-none">search</span>
      <input 
        id="globalSearchInput"
        class="w-full h-9 pl-9 pr-14 bg-surface-container-low text-on-surface text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy focus:bg-white transition-all placeholder:text-slate-400" 
        placeholder="Search candidates, drives, skills matrix, NAAC compliance (Ctrl+K)..." 
        type="text"
        readonly
        onclick="openModal('modal-omnisearch')"
      />
      <kbd class="absolute right-2.5 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold pointer-events-none">⌘K</kbd>
    </div>
  </div>

  <!-- Header Right Controls & User Profile -->
  <div class="flex items-center gap-2 lg:gap-3 shrink-0">
    <!-- Active AST Node Pill -->
    <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-code text-[11px] font-semibold">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
      <span>AST Node: mum-in-vesit-prod-01</span>
    </div>

    <!-- Role / Persona Switcher Toggle -->
    <div class="relative">
      <button 
        id="personaToggleBtn"
        onclick="togglePersonaDropdown()"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-slate-200/80 border border-slate-200 text-on-surface text-xs font-medium transition-all shadow-sm"
        title="Switch between Placement Dean and Student Persona"
      >
        <span class="material-symbols-outlined text-sm text-brand-navy" id="personaIcon">manage_accounts</span>
        <span class="font-semibold text-slate-900" id="personaLabel">TPO Dean View</span>
        <span class="material-symbols-outlined text-xs text-slate-400">expand_more</span>
      </button>

      <!-- Dropdown Menu -->
      <div id="personaMenu" class="hidden absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 z-50">
        <!-- Active User Info Card -->
        <div id="personaActiveCard" class="p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-2">
          <div class="flex items-center gap-2.5">
            <div id="personaAvatar" class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">DV</div>
            <div class="flex flex-col min-w-0">
              <span id="personaName" class="text-xs font-bold text-slate-900 truncate">Dr. Aris Vance</span>
              <span id="personaRoleDesc" class="text-[11px] text-slate-500 truncate">Head of Career Placements & TPO</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
            <span class="font-mono text-slate-500">Security Guard:</span>
            <span id="personaSecurityTag" class="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 font-mono font-semibold">TPO GOVERNANCE</span>
          </div>
        </div>

        <!-- Switch Portal / Account -->
        <button 
          id="btnSwitchPortal"
          onclick="switchToOppositeRole()" 
          class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors text-xs font-medium group"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-indigo-600">swap_horiz</span>
            <span id="btnSwitchPortalText">Switch to Student Portal</span>
          </div>
          <span class="material-symbols-outlined text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </button>

        <!-- Sign Out / Lock Session -->
        <button 
          onclick="signOut()" 
          class="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-left hover:bg-rose-50 text-rose-700 transition-colors text-xs font-medium"
        >
          <span class="material-symbols-outlined text-[16px] text-rose-600">logout</span>
          <span>Sign Out / Lock Session</span>
        </button>
      </div>
    </div>

    <!-- Quick Action "+ New Drive" Button (Institutional & Ops only) -->
    <button 
      id="btnNewDrive"
      onclick="openModal('modal-new-drive')" 
      class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-semibold shadow-sm shadow-blue-950/20 transition-all active:scale-[0.98] institutional-element"
    >
      <span class="material-symbols-outlined text-[16px]">add_circle</span>
      <span>New Drive</span>
    </button>

    <!-- Notifications Bell Button with Active Drawer Trigger -->
    <button 
      onclick="toggleNotificationsDrawer()" 
      class="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      title="View Alerts & TPO Notifications"
    >
      <span class="material-symbols-outlined text-xl">notifications</span>
      <span class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none animate-pulse">
        3
      </span>
    </button>

    <!-- Global Mobile Menu Button -->
    <button 
      onclick="toggleMobileSidebar()" 
      class="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden"
      title="Toggle Navigation Menu"
    >
      <span class="material-symbols-outlined text-xl">menu</span>
    </button>
  </div>
</header>
`;

// Build Master Sidebar HTML
const masterSidebar = `
<aside id="masterSidebar" class="fixed left-0 top-16 bottom-0 w-64 xl:w-72 bg-surface-container-lowest border-r border-slate-200 z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-300 lg:translate-x-0 -translate-x-full shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
  <div class="p-3 xl:p-4 flex flex-col gap-5">
    
    <!-- Institutional Section -->
    <div id="section-institutional" class="flex flex-col gap-1.5 institutional-element">
      <div class="px-2.5 flex items-center justify-between">
        <span class="font-label-caps text-[10px] font-bold text-slate-500 uppercase tracking-wider">Institutional & Ops</span>
        <span class="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[10px] font-mono font-semibold">TPO</span>
      </div>
      <nav class="flex flex-col gap-0.5">
        <a href="#/cohort-skills" data-route="cohort-skills" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-brand-navy">grid_view</span>
            <span>Cohort Skill Dashboard</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold">81.4%</span>
        </a>

        <a href="#/drive-management" data-route="drive-management" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">calendar_month</span>
            <span>Campus Drive Management</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 font-bold">3 Active</span>
        </a>

        <a href="#/talent-discovery" data-route="talent-discovery" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">person_search</span>
            <span>Talent Discovery & Rules</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">142 Pool</span>
        </a>

        <a href="#/fairness-accreditation" data-route="fairness-accreditation" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">balance</span>
            <span>Fairness & Accreditation</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-bold">NAAC 5.2</span>
        </a>
      </nav>
    </div>

    <!-- Divider -->
    <div id="divider-institutional" class="h-px bg-slate-200 institutional-element"></div>

    <!-- Student Operations Section -->
    <div id="section-student" class="flex flex-col gap-1.5">
      <div class="px-2.5 flex items-center justify-between">
        <span class="font-label-caps text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Candidate View</span>
        <span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-semibold">Ananya S.</span>
      </div>
      <nav class="flex flex-col gap-0.5">
        <a href="#/skill-profile" data-route="skill-profile" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">psychology</span>
            <span>Student Skill Profile</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold">Verified</span>
        </a>

        <a href="#/target-gaps" data-route="target-gaps" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">stacked_bar_chart</span>
            <span>Target Companies & Gaps</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">4 Targets</span>
        </a>

        <a href="#/mock-reports" data-route="mock-reports" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">assignment_turned_in</span>
            <span>Mock Drive Reports</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold">92% High</span>
        </a>

        <a href="#/learning-path" data-route="learning-path" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">alt_route</span>
            <span>Learning Roadmap</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 font-bold">Sprint 2</span>
        </a>

        <a href="#/my-drives" data-route="my-drives" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">verified_user</span>
            <span>My Drives & Eligibility</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold">4 Applied</span>
        </a>

        <a href="#/privacy-consent" data-route="privacy-consent" class="nav-item flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[18px] text-slate-500">shield</span>
            <span>Privacy & DPDP Policy</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold">DPDP ✓</span>
        </a>
      </nav>
    </div>

    <!-- Sidebar Account & Session Controls -->
    <div class="px-2 pt-2 border-t border-slate-200/80 flex flex-col gap-1">
      <button 
        onclick="signOut()" 
        class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all group"
        title="Sign Out and Return to Multi-Tenant Portal Access"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-rose-600">logout</span>
          <span>Sign Out / Switch Portal</span>
        </div>
        <span class="text-[10px] font-mono text-slate-400 group-hover:text-rose-500">Lock</span>
      </button>
    </div>

  </div>

  <!-- Sidebar Footer: Audit & Node Status -->
  <div class="p-3.5 bg-surface-container-low/70 border-t border-slate-200 flex flex-col gap-2">
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
        <span class="font-bold text-slate-800">AST Engine Synced</span>
      </div>
      <span class="font-mono text-[11px] text-slate-500">0s ago</span>
    </div>
    <div class="flex items-center justify-between text-[11px] text-slate-500">
      <span>Audit Hash: #0x89F2A</span>
      <span class="text-emerald-700 font-semibold">Integrity 100%</span>
    </div>
  </div>
</aside>
`;

// Build all Modals, Drawers and Popups
const allModals = `
<!-- ========================================== -->
<!-- 1. OMNISEARCH COMMAND PALETTE MODAL (Ctrl+K) -->
<!-- ========================================== -->
<div id="modal-omnisearch" class="modal-overlay hidden fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <!-- Search Bar -->
    <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
      <span class="material-symbols-outlined text-slate-400 text-xl">search</span>
      <input 
        id="omniSearchQuery" 
        type="text" 
        class="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none" 
        placeholder="Type to search students, drives, skills, companies, rules, NAAC metrics..." 
        oninput="handleOmniSearch(this.value)"
      />
      <button onclick="closeModal('modal-omnisearch')" class="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100 font-mono">ESC</button>
    </div>

    <!-- Quick Filters -->
    <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs overflow-x-auto">
      <span class="text-slate-400 font-medium">Quick jump:</span>
      <button onclick="navigateRoute('cohort-skills'); closeModal('modal-omnisearch')" class="institutional-element px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">Cohort Analytics</button>
      <button onclick="navigateRoute('drive-management'); closeModal('modal-omnisearch')" class="institutional-element px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">Drive Management</button>
      <button onclick="navigateRoute('talent-discovery'); closeModal('modal-omnisearch')" class="institutional-element px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">Talent Pool</button>
      <button onclick="navigateRoute('skill-profile'); closeModal('modal-omnisearch')" class="student-element px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium">Ananya Sharma (Profile)</button>
    </div>

    <!-- Results Container -->
    <div id="omniSearchResults" class="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
      <div class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between" onclick="navigateRoute('skill-profile'); closeModal('modal-omnisearch')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">AS</div>
          <div>
            <div class="text-xs font-bold text-slate-900">Ananya Sharma (Student)</div>
            <div class="text-[11px] text-slate-500">B.Tech CMPN • CGPA 8.84 • AST Verified 94th Percentile</div>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">TPO Verified</span>
      </div>

      <div class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between" onclick="navigateRoute('drive-management'); closeModal('modal-omnisearch')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs"><span class="material-symbols-outlined text-sm">business_center</span></div>
          <div>
            <div class="text-xs font-bold text-slate-900">Proofpoint Cyber Defense Drive</div>
            <div class="text-[11px] text-slate-500">CTC: 24 LPA • Slots Allocated: Lab 301 • Zero Clashes</div>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold">Active Nov 24</span>
      </div>

      <div class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between" onclick="navigateRoute('fairness-accreditation'); closeModal('modal-omnisearch')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs"><span class="material-symbols-outlined text-sm">verified</span></div>
          <div>
            <div class="text-xs font-bold text-slate-900">NAAC Criterion 5.2.1 Audit & NIRF Ledger</div>
            <div class="text-[11px] text-slate-500">Demographic Adverse Impact Ratio: 0.94 (Optimal)</div>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">Compliant</span>
      </div>

      <div class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between" onclick="navigateRoute('mock-reports'); closeModal('modal-omnisearch')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs"><span class="material-symbols-outlined text-sm">assignment_turned_in</span></div>
          <div>
            <div class="text-xs font-bold text-slate-900">Mock Drive Diagnostic: Machine Coding & SQL</div>
            <div class="text-[11px] text-slate-500">Overall Score: 92% • Recovery Sprint Assigned</div>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold">Report Ready</span>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 2. NOTIFICATIONS FLYOUT DRAWER -->
<!-- ========================================== -->
<div id="drawer-notifications" class="fixed inset-0 z-50 pointer-events-none">
  <!-- Backdrop -->
  <div id="notificationsBackdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 transition-opacity pointer-events-auto hidden" onclick="toggleNotificationsDrawer()"></div>
  
  <!-- Slide-in Drawer -->
  <div id="notificationsPanel" class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transform translate-x-full transition-transform duration-300 pointer-events-auto">
    <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-navy">notifications_active</span>
        <h3 class="font-bold text-slate-900 text-sm">System Alerts & Placement Queue</h3>
      </div>
      <button onclick="toggleNotificationsDrawer()" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Notification Tabs -->
    <div class="flex items-center border-b border-slate-200 px-4 bg-white text-xs">
      <button class="py-2.5 px-3 border-b-2 border-brand-navy font-bold text-brand-navy">All (3)</button>
      <button class="py-2.5 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800">Drives</button>
      <button class="py-2.5 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800">Appeals</button>
      <button class="py-2.5 px-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800">Audit</button>
    </div>

    <!-- Notifications List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <!-- Item 1 -->
      <div class="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">Campus Drive</span>
          <span class="text-[10px] text-slate-400">12m ago</span>
        </div>
        <p class="text-xs text-slate-800 font-medium">Clash Check Passed: Barclays drive scheduled for Nov 22 in Auditorium A with 0 conflicts.</p>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="navigateRoute('drive-management'); toggleNotificationsDrawer();" class="text-xs font-semibold text-brand-navy hover:underline">View Schedule →</button>
        </div>
      </div>

      <!-- Item 2 -->
      <div class="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">Placement Appeal</span>
          <span class="text-[10px] text-slate-400">1h ago</span>
        </div>
        <p class="text-xs text-slate-800 font-medium">Ananya Sharma lodged an institutional appeal for Atlassian drive (Rule: Distributed Systems AST validation).</p>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="openAppealModal('Atlassian', 'Distributed Systems AST Rule'); toggleNotificationsDrawer();" class="text-xs font-semibold text-amber-800 hover:underline">Review Evidence →</button>
        </div>
      </div>

      <!-- Item 3 -->
      <div class="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">Accreditation</span>
          <span class="text-[10px] text-slate-400">3h ago</span>
        </div>
        <p class="text-xs text-slate-800 font-medium">NAAC Criterion 5.2.1 Demographic Ledger cryptographically signed and sealed with SHA-256 hash.</p>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="navigateRoute('fairness-accreditation'); toggleNotificationsDrawer();" class="text-xs font-semibold text-emerald-800 hover:underline">Inspect Ledger →</button>
        </div>
      </div>
    </div>

    <div class="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
      <button onclick="showToast('All notifications marked as read', 'done_all')" class="text-xs font-semibold text-slate-600 hover:text-slate-900">Mark all as read</button>
      <button onclick="toggleNotificationsDrawer()" class="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium">Close</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 3. CANDIDATE QUICK PREVIEW DRAWER -->
<!-- ========================================== -->
<div id="drawer-candidate" class="fixed inset-0 z-50 pointer-events-none">
  <div id="candidateBackdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 transition-opacity pointer-events-auto hidden" onclick="closeCandidateDrawer()"></div>
  
  <div id="candidatePanel" class="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transform translate-x-full transition-transform duration-300 pointer-events-auto">
    <!-- Header -->
    <div class="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img id="candidateDrawerPhoto" class="w-12 h-12 rounded-full object-cover ring-2 ring-brand-navy/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByuiXG3IiAfNyrse-aqvEUxpYG2CL75RcRcsYXVllDoFEqVsIsb8mnu1liynOT73z96BCxqC3CpJcMZ4HcRzVJJdJWQSA94y_ZYorI1kAQA3a3-G6PkhLRgkqNwP48DCdJGyaPc3glhk-4vTdBXlLJU4gLOVzKOXS6m0gzEWrfNW9PZXd-RqyBUcNTJJgtvzNBp8nN8NqAKsDIyoa0zseXo00JcphGehsaRPN9TnQ" alt="Candidate"/>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h3 id="candidateDrawerName" class="font-bold text-slate-900 text-base">Ananya Sharma</h3>
            <span id="candidateDrawerBadge" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">TPO Verified</span>
          </div>
          <span id="candidateDrawerMeta" class="text-xs text-slate-600">B.Tech CMPN • Batch 2025 • CGPA 8.84</span>
        </div>
      </div>
      <button onclick="closeCandidateDrawer()" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Candidate Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-4">
      <!-- Readiness Radar / Metric -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Placement Readiness</div>
          <div class="text-lg font-bold text-brand-navy mt-0.5">94.2%</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[10px] text-slate-500 uppercase font-semibold">AST Verified Nodes</div>
          <div class="text-lg font-bold text-emerald-700 mt-0.5">48 / 50</div>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Mock Score</div>
          <div class="text-lg font-bold text-blue-700 mt-0.5">92.0%</div>
        </div>
      </div>

      <!-- Verified Competencies -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Validated Skills & Evidence</h4>
        <div class="flex flex-wrap gap-1.5">
          <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">verified</span>Distributed Systems (Go)</span>
          <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">verified</span>eBPF Kernel Tracing</span>
          <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">verified</span>SQL & Windowing</span>
          <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">verified</span>Raft Consensus Protocol</span>
          <span class="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">pending</span>Redis Caching</span>
        </div>
      </div>

      <!-- Verified Git Repos -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Cryptographic Proof Source</h4>
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div class="flex items-center justify-between font-mono font-medium">
            <span>github.com/ananya-vesit/distributed-raft</span>
            <span class="text-emerald-700 font-bold">142 Commits ✓</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono truncate">SHA: e8f92b74c01d98a2e57613c2f901ab8741d2003c</div>
        </div>
      </div>

      <!-- Eligible Drives -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Company Drive Match</h4>
        <div class="space-y-1.5 text-xs">
          <div class="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <span class="font-bold text-slate-800">Proofpoint (Tier-1 Systems)</span>
            <span class="font-bold text-emerald-800">98% Match • Eligible</span>
          </div>
          <div class="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <span class="font-bold text-slate-800">Goldman Sachs (Fintech)</span>
            <span class="font-bold text-emerald-800">92% Match • Shortlisted</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
      <button onclick="navigateRoute('skill-profile'); closeCandidateDrawer();" class="flex-1 py-2 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-bold transition-all text-center">
        Open Full Profile
      </button>
      <button onclick="showToast('Candidate shortlisted for Tier-1 drive pool', 'bookmark'); closeCandidateDrawer();" class="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all">
        Shortlist
      </button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 4. NEW CAMPUS DRIVE & CLASH-FREE SLOT MODAL -->
<!-- ========================================== -->
<div id="modal-new-drive" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <!-- Header -->
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold">
          <span class="material-symbols-outlined text-lg">calendar_add_on</span>
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Schedule Campus Drive & Clash-Free Slot</h3>
          <p class="text-[11px] text-slate-500">Autonomous Proctor & Lab Optimization Engine</p>
        </div>
      </div>
      <button onclick="closeModal('modal-new-drive')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Form -->
    <form id="newDriveForm" onsubmit="handleCreateDrive(event)" class="p-5 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Company / Recruiter Name *</label>
          <input required id="driveCompany" type="text" placeholder="e.g. Proofpoint, Google, Uber" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy text-xs"/>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Offered Package (CTC) *</label>
          <input required id="driveCtc" type="text" placeholder="e.g. 24.5 LPA (18 Base + Stock)" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy text-xs"/>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Min CGPA *</label>
          <input required id="driveCgpa" type="number" step="0.1" value="7.5" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy text-xs"/>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Drive Date *</label>
          <input required id="driveDate" type="date" value="2024-11-25" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy text-xs"/>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Assigned Facility *</label>
          <select id="driveFacility" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-navy text-xs bg-white">
            <option>Lab 301 (70 PCs)</option>
            <option>Auditorium A (240 Capacity)</option>
            <option>Seminar Hall 2 (120 Capacity)</option>
            <option>Virtual Proctor Sandbox</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Eligible Branches</label>
        <div class="flex flex-wrap gap-2 pt-0.5">
          <label class="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="rounded border-slate-300 text-brand-navy focus:ring-0"/>
            <span>CMPN</span>
          </label>
          <label class="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input type="checkbox" checked class="rounded border-slate-300 text-brand-navy focus:ring-0"/>
            <span>INFT</span>
          </label>
          <label class="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input type="checkbox" class="rounded border-slate-300 text-brand-navy focus:ring-0"/>
            <span>EXTC</span>
          </label>
          <label class="flex items-center gap-1.5 text-slate-700 cursor-pointer">
            <input type="checkbox" class="rounded border-slate-300 text-brand-navy focus:ring-0"/>
            <span>INST</span>
          </label>
        </div>
      </div>

      <!-- Real-time Clash Check Simulator -->
      <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
          <span class="text-xs font-bold text-emerald-900">AI Conflict Matrix: 0 Clashes Detected</span>
        </div>
        <span class="text-[10px] text-emerald-800 font-mono">Room & Evaluators Clear</span>
      </div>

      <!-- Submit Footer -->
      <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
        <button type="button" onclick="closeModal('modal-new-drive')" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Cancel</button>
        <button type="submit" class="px-5 py-2 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-bold shadow-sm shadow-blue-950/20">Allocate & Publish Drive</button>
      </div>
    </form>
  </div>
</div>

<!-- ========================================== -->
<!-- 5. RECRUITER OUTREACH CAMPAIGN MODAL -->
<!-- ========================================== -->
<div id="modal-outreach" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-brand-navy text-xl">campaign</span>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Recruiter Outreach & Campaign Dispatcher</h3>
          <p class="text-[11px] text-slate-500">Automated AST Talent Showcase to Tier-1 Recruiters</p>
        </div>
      </div>
      <button onclick="closeModal('modal-outreach')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-4 text-xs">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Target Recruiter Cohort</label>
        <select class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white">
          <option>Tier-1 Distributed Systems & Security (Proofpoint, Google, Cloudflare)</option>
          <option>Fintech Engineering (Goldman Sachs, Morgan Stanley, JPMC)</option>
          <option>High-Growth Unicorns (Uber, Atlassian, Razorpay)</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Personalized Campaign Pitch</label>
        <textarea rows="4" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-brand-navy">Greetings Campus Hiring Team,

VESIT Autonomous Mumbai presents our 2025 Graduating Class. 142 students possess Proofpoint AST-verified code mastery in Distributed Go, eBPF Kernel Tracing, and Raft consensus with zero academic backlogs and an average CGPA of 8.84.

Review our interactive talent pool dossier and book early placement slots.</textarea>
      </div>

      <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
        <span class="font-medium text-blue-900">Attached: Cryptographically Sealed Batch Dossier (PDF & CSV)</span>
        <span class="font-mono text-blue-800 font-bold">142 Candidates</span>
      </div>

      <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
        <button type="button" onclick="closeModal('modal-outreach')" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Cancel</button>
        <button onclick="dispatchOutreachCampaign()" class="px-5 py-2 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-bold">Dispatch Campaign to 48 Recruiters</button>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 6. STATUTORY ACCREDITATION EXPORT MODAL -->
<!-- ========================================== -->
<div id="modal-accreditation" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-emerald-700 text-xl">verified_user</span>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Export Statutory NAAC & NIRF Accreditation Pack</h3>
          <p class="text-[11px] text-slate-500">Criterion 5.2.1 • Student Placement & Progression • Class 2024-2025</p>
        </div>
      </div>
      <button onclick="closeModal('modal-accreditation')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-4 text-xs">
      <!-- Preview Table -->
      <div class="border border-slate-200 rounded-xl overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-600">
            <tr>
              <th class="p-2.5">Accreditation Metric</th>
              <th class="p-2.5">Verified Figure</th>
              <th class="p-2.5">Compliance Standard</th>
              <th class="p-2.5">Audit Stamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="p-2.5 font-semibold text-slate-800">NAAC Criterion 5.2.1 (Placement %)</td>
              <td class="p-2.5 font-mono font-bold text-emerald-700">92.4% Verified</td>
              <td class="p-2.5 text-slate-500">Benchmark: &gt; 85%</td>
              <td class="p-2.5 font-mono text-[10px] text-slate-400">#0xNAAC-VESIT-24</td>
            </tr>
            <tr>
              <td class="p-2.5 font-semibold text-slate-800">Adverse Impact Ratio (AIR - Gender)</td>
              <td class="p-2.5 font-mono font-bold text-emerald-700">0.96 Parity</td>
              <td class="p-2.5 text-slate-500">Statutory: 0.80 - 1.25</td>
              <td class="p-2.5 font-mono text-[10px] text-slate-400">#0xAIR-PASS-096</td>
            </tr>
            <tr>
              <td class="p-2.5 font-semibold text-slate-800">Social Category Offer Equity</td>
              <td class="p-2.5 font-mono font-bold text-emerald-700">100% Balanced</td>
              <td class="p-2.5 text-slate-500">Zero Disparity Flagged</td>
              <td class="p-2.5 font-mono text-[10px] text-slate-400">#0xEQUITY-OK</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="downloadAccreditationPDF()" class="flex-1 py-2.5 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
          <span>Download Signed Accreditation PDF</span>
        </button>
        <button onclick="downloadAccreditationCSV()" class="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-sm">table_view</span>
          <span>Download NAAC Excel Sheet (.XLSX)</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 7. CODE DIFF & FIX PATCH MODAL -->
<!-- ========================================== -->
<div id="modal-code-diff" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-blue-400 text-xl">difference</span>
        <div>
          <h3 class="font-bold text-sm">AST Code Diff & Fix Patch: Window Partitioning</h3>
          <p class="text-[11px] text-slate-400">Optimal O(N) AST Rewrite for Retention Rolling Aggregation</p>
        </div>
      </div>
      <button onclick="closeModal('modal-code-diff')" class="p-1 rounded-lg text-slate-400 hover:text-white">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-4 space-y-3 font-mono text-xs bg-slate-950 text-slate-200 max-h-96 overflow-y-auto">
      <div class="text-slate-400 text-[11px]">// Student Query (Failed Edge Case on NULL event_timestamp in partition)</div>
      <div class="p-2.5 rounded bg-rose-950/40 border border-rose-900 text-rose-300">
        - SELECT user_id, LAG(event_timestamp) OVER (ORDER BY user_id) AS prev_event<br/>
        - FROM app_telemetry<br/>
        - WHERE session_duration &gt; 0;
      </div>

      <div class="text-slate-400 text-[11px] mt-3">// AST-Validated Optimal Patch (Handles partition boundary & nulls cleanly in 4ms)</div>
      <div class="p-2.5 rounded bg-emerald-950/40 border border-emerald-900 text-emerald-300">
        + SELECT user_id,<br/>
        + &nbsp;&nbsp;LAG(event_timestamp, 1) OVER (<br/>
        + &nbsp;&nbsp;&nbsp;&nbsp;PARTITION BY user_id<br/>
        + &nbsp;&nbsp;&nbsp;&nbsp;ORDER BY event_timestamp ASC NULLS LAST<br/>
        + &nbsp;&nbsp;) AS prev_session_ts<br/>
        + FROM app_telemetry<br/>
        + WHERE session_duration IS NOT NULL;
      </div>

      <div class="text-[11px] text-slate-400 mt-2">
        <span class="text-emerald-400 font-bold">Explanation:</span> Adding <code class="text-blue-300">PARTITION BY user_id</code> isolates rolling window contexts per user identity without cross-tenant bleed, improving execution speed by 4.2x.
      </div>
    </div>

    <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
      <button onclick="closeModal('modal-code-diff')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Close</button>
      <button onclick="applyCodePatch()" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Apply Patch to Workspace</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 8. INTERACTIVE SQL / PRACTICE DRILL SANDBOX -->
<!-- ========================================== -->
<div id="modal-sandbox" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-emerald-400">terminal</span>
        <h3 class="font-bold text-sm">Interactive AST Practice Sandbox: SQL Window Functions</h3>
      </div>
      <button onclick="closeModal('modal-sandbox')" class="p-1 rounded-lg text-slate-400 hover:text-white">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-4 space-y-3 bg-slate-950 text-slate-200 text-xs">
      <div class="text-slate-400">Task: Write a query to compute 7-day retention cohorts partitioned by user id.</div>
      <textarea id="sandboxCodeEditor" rows="6" class="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500">SELECT 
  user_id,
  event_date,
  DATEDIFF('day', LAG(event_date) OVER (PARTITION BY user_id ORDER BY event_date), event_date) AS days_between
FROM user_activity_log;</textarea>

      <div id="sandboxOutput" class="hidden p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300">
        <div class="flex items-center justify-between mb-1.5 text-slate-400 border-b border-slate-800 pb-1">
          <span>Query Execution Result</span>
          <span class="text-emerald-400 font-bold">PASSED (4/4 Test Cases)</span>
        </div>
        <div>Rows Returned: 3 | Execution Time: 3.8ms | Memory: 2.1 MB</div>
        <div class="mt-1 text-slate-300">101 | 2024-11-01 | NULL<br/>101 | 2024-11-03 | 2<br/>101 | 2024-11-10 | 7</div>
      </div>
    </div>

    <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
      <span class="text-[11px] text-slate-400 font-mono">AST Validator: Online</span>
      <div class="flex items-center gap-2">
        <button onclick="runSandboxQuery()" class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">play_arrow</span>
          <span>Run Query</span>
        </button>
        <button onclick="submitSandboxSolution()" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
          Submit to Profile
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 9. AI AUDIO REPLAY INTERVIEW FEEDBACK MODAL -->
<!-- ========================================== -->
<div id="modal-audio-replay" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-brand-navy text-xl">record_voice_over</span>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">AI Interview Audio Replay & Telemetry</h3>
          <p class="text-[11px] text-slate-500">Question 3: "Handling Split-Brain in Raft Consensus"</p>
        </div>
      </div>
      <button onclick="closeModal('modal-audio-replay')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-4 text-xs">
      <!-- Animated Waveform Mockup -->
      <div class="p-4 rounded-xl bg-slate-900 text-white flex flex-col gap-3">
        <div class="flex items-center justify-between text-[11px] text-slate-400">
          <span>01:24 / 03:15</span>
          <span class="text-emerald-400 font-semibold font-mono">Clarity: 94% • Pace: 132 wpm</span>
        </div>
        <div class="flex items-end gap-1 h-12 justify-center px-2">
          <div class="w-1 bg-emerald-400 h-4 rounded-full animate-pulse"></div>
          <div class="w-1 bg-emerald-400 h-8 rounded-full animate-pulse"></div>
          <div class="w-1 bg-emerald-400 h-10 rounded-full"></div>
          <div class="w-1 bg-emerald-400 h-6 rounded-full animate-pulse"></div>
          <div class="w-1 bg-emerald-400 h-12 rounded-full"></div>
          <div class="w-1 bg-emerald-400 h-5 rounded-full"></div>
          <div class="w-1 bg-emerald-400 h-9 rounded-full animate-pulse"></div>
          <div class="w-1 bg-emerald-400 h-11 rounded-full"></div>
          <div class="w-1 bg-emerald-400 h-7 rounded-full"></div>
          <div class="w-1 bg-emerald-400 h-3 rounded-full"></div>
        </div>
        <div class="flex items-center justify-center gap-4 pt-1">
          <button class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"><span class="material-symbols-outlined text-sm">replay_10</span></button>
          <button class="p-3 rounded-full bg-brand-navy hover:bg-slate-800 text-white shadow"><span class="material-symbols-outlined text-lg">play_arrow</span></button>
          <button class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white"><span class="material-symbols-outlined text-sm">forward_10</span></button>
        </div>
      </div>

      <!-- Transcript snippet -->
      <div class="space-y-1">
        <span class="font-bold text-slate-800">Verbatim Transcript Snippet:</span>
        <p class="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic leading-relaxed">
          "When a network partition happens, the partitioned minority cannot elect a leader because they fail to gather a quorum of (N/2)+1 votes. The majority cluster continues processing writes..."
        </p>
      </div>

      <!-- Feedback -->
      <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
        <span class="font-bold">AI Evaluator Feedback:</span> Excellent explanation of the quorum majority rule. Minor suggestion: emphasize log replication index match condition.
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 10. AI PROCTOR BIOMETRIC TELEMETRY LOG MODAL -->
<!-- ========================================== -->
<div id="modal-telemetry" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-emerald-400">visibility</span>
        <h3 class="font-bold text-sm">AI Proctor Telemetry & Biometric Integrity Log</h3>
      </div>
      <button onclick="closeModal('modal-telemetry')" class="p-1 rounded-lg text-slate-400 hover:text-white">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-4 space-y-3 font-mono text-xs bg-slate-950 text-slate-300 max-h-96 overflow-y-auto">
      <div class="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
        <span class="text-slate-400">Overall Trust Score:</span>
        <span class="text-emerald-400 font-bold">98.4% (GREEN - VERIFIED AUTHENTIC)</span>
      </div>

      <div class="space-y-2 text-[11px] pt-1">
        <div class="flex items-start gap-2 text-slate-400">
          <span class="text-slate-500">00:02:14</span>
          <span class="text-emerald-400">[GAZE_CHECK]</span>
          <span>Dual monitor setup calibrated. Eye gaze maintained in viewport.</span>
        </div>
        <div class="flex items-start gap-2 text-slate-400">
          <span class="text-slate-500">00:14:32</span>
          <span class="text-blue-400">[FOCUS_EVENT]</span>
          <span>Browser focus buffer loss 1.2s (Terminal copy-paste shortcut cleared).</span>
        </div>
        <div class="flex items-start gap-2 text-slate-400">
          <span class="text-slate-500">00:28:45</span>
          <span class="text-emerald-400">[KEYSTROKE_DYNAMICS]</span>
          <span>112 WPM burst rate. Typist biometric pattern matches student profile.</span>
        </div>
        <div class="flex items-start gap-2 text-slate-400">
          <span class="text-slate-500">00:45:10</span>
          <span class="text-emerald-400">[AUDIO_INTEGRITY]</span>
          <span>No ambient voice anomalies or multiple speakers detected.</span>
        </div>
      </div>
    </div>

    <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
      <button onclick="closeModal('modal-telemetry')" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">Done</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 11. BENCHMARK SPEC & RUBRIC MODAL -->
<!-- ========================================== -->
<div id="modal-project-spec" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-brand-navy text-xl">menu_book</span>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Engineering Spec & Proctor Rubric</h3>
          <p class="text-[11px] text-slate-500">Capstone: Distributed Key-Value Store with Raft Consensus</p>
        </div>
      </div>
      <button onclick="closeModal('modal-project-spec')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-3 text-xs overflow-y-auto max-h-96">
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <h4 class="font-bold text-slate-900">Module Objective</h4>
        <p class="text-slate-600 leading-relaxed">Implement leader election, log replication, and safety guarantees conforming to Diego Ongaro's Raft specification in Go 1.22.</p>
      </div>

      <div class="space-y-2">
        <h4 class="font-bold text-slate-900">Evaluation Rubric & Weightage:</h4>
        <div class="divide-y divide-slate-100 border border-slate-200 rounded-lg text-slate-700">
          <div class="p-2 flex justify-between"><span>Leader Election under Network Partition</span><span class="font-bold">30%</span></div>
          <div class="p-2 flex justify-between"><span>Log Replication & Quorum Commitment</span><span class="font-bold">30%</span></div>
          <div class="p-2 flex justify-between"><span>Zero Data Loss on Crash Recovery</span><span class="font-bold">25%</span></div>
          <div class="p-2 flex justify-between"><span>AST Code Quality & Idiomatic Go</span><span class="font-bold">15%</span></div>
        </div>
      </div>
    </div>

    <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
      <button onclick="closeModal('modal-project-spec')" class="px-4 py-2 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-bold text-xs">Close</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 12. 1:1 CODE REVIEW BOOKING MODAL -->
<!-- ========================================== -->
<div id="modal-code-review" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-navy">support_agent</span>
        <h3 class="font-bold text-slate-900 text-sm">Schedule 1:1 Code Review</h3>
      </div>
      <button onclick="closeModal('modal-code-review')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-3 text-xs">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Select Mentor / VESIT Alumni</label>
        <select class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white">
          <option>Ketan K. (Senior Distributed Systems Engineer @ Proofpoint)</option>
          <option>Sneha M. (Staff Software Engineer @ Google Cloud)</option>
          <option>Dr. Aris Vance (TPO Dean & Systems Professor)</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
        <select class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white">
          <option>Wednesday, 4:30 PM - 5:15 PM IST</option>
          <option>Friday, 11:00 AM - 11:45 AM IST</option>
          <option>Saturday, 2:00 PM - 2:45 PM IST</option>
        </select>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">GitHub Branch / PR Link</label>
        <input type="text" value="https://github.com/ananya-vesit/distributed-raft/tree/fix/leader-election" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"/>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button onclick="closeModal('modal-code-review')" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700">Cancel</button>
        <button onclick="confirmCodeReviewBooking()" class="px-4 py-2 rounded-lg bg-brand-navy text-white font-bold">Book 1:1 Review Slot</button>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 13. DPDP RIGHT TO ERASURE / ARCHIVE MODAL -->
<!-- ========================================== -->
<div id="modal-dpdp-erase" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-rose-600">delete_forever</span>
        <h3 class="font-bold text-rose-900 text-sm">DPDP Act 2023: Right to Erasure</h3>
      </div>
      <button onclick="closeModal('modal-dpdp-erase')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-3 text-xs">
      <p class="text-slate-600 leading-relaxed">
        Under Section 12 of the Digital Personal Data Protection Act (DPDP) 2023, you have the right to request erasure of your behavioral telemetry and AST repository ingestion cache.
      </p>

      <div class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
        Note: Mandatory accreditation placement records required under NAAC/NIRF statutory compliance will be pseudonymized rather than destroyed.
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Type CONFIRM_PURGE to proceed:</label>
        <input id="purgeConfirmInput" type="text" placeholder="CONFIRM_PURGE" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"/>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button onclick="closeModal('modal-dpdp-erase')" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700">Cancel</button>
        <button onclick="executeDataPurge()" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold">Initiate Purge Request</button>
      </div>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 14. EXPLAINABILITY WHITEPAPER MODAL -->
<!-- ========================================== -->
<div id="modal-whitepaper" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-brand-navy">description</span>
        <h3 class="font-bold text-slate-900 text-sm">Proofpoint Agent Explainability & Transparency Whitepaper</h3>
      </div>
      <button onclick="closeModal('modal-whitepaper')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-3 text-xs max-h-96 overflow-y-auto leading-relaxed text-slate-700">
      <h4 class="font-bold text-slate-900 text-sm">Abstract: Non-Discriminatory Deterministic AST Verification</h4>
      <p>
        The Quasar Placement Intelligence platform utilizes deterministic Abstract Syntax Tree (AST) static analysis rather than opaque black-box machine learning models for talent qualification. By measuring concrete syntactic structures (e.g. concurrency primitives, socket wrappers, Raft states) rather than demographic attributes, the system satisfies Section 8 of the DPDP Act and Supreme Court guidelines on statutory parity.
      </p>
      <h4 class="font-bold text-slate-900 text-sm pt-2">Audit Trails & Verification Hashes</h4>
      <p>
        Each evaluation produces an immutable SHA-256 state hash stored in the VESIT institutional ledger, granting candidates full right of appeal and human-in-the-loop review.
      </p>
    </div>

    <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
      <button onclick="closeModal('modal-whitepaper')" class="px-4 py-2 rounded-lg bg-brand-navy text-white font-bold text-xs">Close Whitepaper</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 15. TPO & STUDENT HELP DESK MODAL -->
<!-- ========================================== -->
<div id="modal-helpdesk" class="modal-overlay hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
  <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" onclick="event.stopPropagation()">
    <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-brand-navy text-xl">contact_support</span>
        <div>
          <h3 class="font-bold text-slate-900 text-sm">VESIT Placement & IT Help Desk</h3>
          <p class="text-[11px] text-slate-500">Autonomous Campus Multi-Tenant Support</p>
        </div>
      </div>
      <button onclick="closeModal('modal-helpdesk')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <div class="p-5 space-y-3.5 text-xs text-slate-700">
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900">Training & Placement Office</span>
          <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">Open 9am-6pm</span>
        </div>
        <p class="text-slate-600 leading-relaxed">Office 304, Academic Block A, VESIT Chembur, Mumbai. For drive schedule discrepancies, FIDO2 token resets, or DPDP compliance queries.</p>
        <div class="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
          <span>Tel: +91 22 6153 2500</span>
          <span>Ext: 4102 / 4105</span>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
        <span class="font-bold text-indigo-950">Immediate Support Channels</span>
        <div class="space-y-1 text-indigo-800">
          <div>• Email: <code class="font-mono text-indigo-900">tpo-support@ves.ac.in</code></div>
          <div>• Student Cell: <code class="font-mono text-indigo-900">placement-rep@ves.ac.in</code></div>
          <div>• Security & AST Node Hotline: <code class="font-mono text-indigo-900">mum-ops@proofpoint.internal</code></div>
        </div>
      </div>
    </div>

    <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
      <button onclick="closeModal('modal-helpdesk')" class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">Close</button>
    </div>
  </div>
</div>

<!-- ========================================== -->
<!-- 16. GLOBAL FLOATING TOAST NOTIFICATION -->
<!-- ========================================== -->
<div id="toastNotification" class="fixed bottom-6 right-6 z-50 transform translate-y-10 opacity-0 pointer-events-none transition-all duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
  <span id="toastIcon" class="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
  <div class="flex flex-col">
    <span id="toastMessage" class="text-xs font-semibold text-slate-100">Operation completed successfully.</span>
  </div>
</div>
`;

// Build Master App HTML
const masterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Proofpoint × VESIT Autonomous Quasar Placement Intelligence Platform v5.4">
  <title>Proofpoint × VESIT Quasar Placement Intelligence Platform</title>

  <!-- Typography: Hanken Grotesk & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Google Material Symbols Outlined -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">

  <!-- Tailwind CSS with Forms and Container Queries -->
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script id="tailwind-config">
    tailwind.config = ${JSON.stringify(masterTwConfig, null, 2)};
  </script>

  <style>
    @layer base {
      html, body {
        margin: 0;
        padding: 0;
        font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
      }
      body {
        overscroll-behavior: none;
        background-color: #faf8ff;
      }
      main > :first-child {
        margin-top: 0 !important;
      }
      main > :last-child {
        margin-bottom: 0 !important;
      }
    }
    
    /* Clean custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Active navigation highlighting */
    .nav-item.active {
      background-color: #0f172a !important;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
    }
    .nav-item.active span.material-symbols-outlined {
      color: #ffffff !important;
    }
    .nav-item.active span.font-mono {
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }

    /* Smooth page and modal animations */
    .view-panel {
      transition: opacity 0.2s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Glass panel & grid background for Login Portal */
    .glass-panel {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .grid-bg {
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
    }

    /* Hide Institutional & Ops elements when in Student Candidate View */
    body.in-student-view .institutional-element,
    body[data-perspective="student"] .institutional-element,
    body.in-student-view #section-institutional,
    body.in-student-view #divider-institutional {
      display: none !important;
    }

    /* Hide Student Candidate View elements when in TPO Admin View */
    body.in-admin-view .student-element,
    body[data-perspective="admin"] .student-element,
    body.in-admin-view #section-student {
      display: none !important;
    }

    /* When on Login view, isolate and expand full screen without header/sidebar */
    body.in-login-view #masterHeader,
    body.in-login-view #masterSidebar {
      display: none !important;
    }
    body.in-login-view #appLayoutWrapper {
      padding-left: 0 !important;
      padding-top: 0 !important;
    }
  </style>
</head>
<body class="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">

  <!-- Master Top Navigation Bar -->
  ${masterHeader}

  <!-- Master Fixed Sidebar -->
  ${masterSidebar}

  <!-- Master Application Content Wrapper -->
  <div id="appLayoutWrapper" class="lg:pl-64 xl:pl-72 pt-16 min-h-screen bg-surface transition-all duration-200">
    <main class="w-full min-h-[calc(100vh-4rem)]">
      
      <!-- View 0: Multi-Tenant Login Portal -->
      <div id="view-login" class="view-panel w-full min-h-screen hidden">
        ${viewHtmlMap['login']}
      </div>

      <!-- View 1: Cohort Skill Dashboard -->
      <div id="view-cohort-skills" class="view-panel w-full p-4 lg:p-6 space-y-4">
        ${viewHtmlMap['cohort-skills']}
      </div>

      <!-- View 2: Drive Management & Scheduling -->
      <div id="view-drive-management" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['drive-management']}
      </div>

      <!-- View 3: Talent Discovery & Rules -->
      <div id="view-talent-discovery" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['talent-discovery']}
      </div>

      <!-- View 4: Fairness & Accreditation -->
      <div id="view-fairness-accreditation" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['fairness-accreditation']}
      </div>

      <!-- View 5: Student Skill Profile -->
      <div id="view-skill-profile" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['skill-profile']}
      </div>

      <!-- View 6: Target Companies & Gaps -->
      <div id="view-target-gaps" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['target-gaps']}
      </div>

      <!-- View 7: Mock Drive Reports -->
      <div id="view-mock-reports" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['mock-reports']}
      </div>

      <!-- View 8: Personal Learning Roadmap -->
      <div id="view-learning-path" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['learning-path']}
      </div>

      <!-- View 9: My Drives & Eligibility -->
      <div id="view-my-drives" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['my-drives']}
      </div>

      <!-- View 10: Privacy & Consent -->
      <div id="view-privacy-consent" class="view-panel w-full p-4 lg:p-6 space-y-4 hidden">
        ${viewHtmlMap['privacy-consent']}
      </div>

    </main>
  </div>

  <!-- All Global Modals, Drawers, Dialogs and Toasts -->
  ${allModals}

  <!-- Master Application Controller Script -->
  <script>
    // ==========================================
    // ROUTING & NAVIGATION
    // ==========================================
    const routes = [
      'login',
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

    const studentRoutes = [
      'skill-profile',
      'target-gaps',
      'mock-reports',
      'learning-path',
      'my-drives',
      'privacy-consent'
    ];

    const institutionalRoutes = [
      'cohort-skills',
      'drive-management',
      'talent-discovery',
      'fairness-accreditation'
    ];

    // Auth & Perspective State
    let currentAuthRole = null;       // 'student' | 'admin' | null
    let authLocked = false;            // Strict route protection active when true
    let currentPerspective = 'admin';  // 'admin' | 'student'
    let currentPersona = 'dean';       // backward compatibility
    let currentLoginTabRole = 'student'; // 'student' | 'tpo'

    function updatePerspectiveUI(perspective) {
      const isStudent = (perspective === 'student' || perspective === true);
      currentPerspective = isStudent ? 'student' : 'admin';
      currentPersona = isStudent ? 'student' : 'dean';

      if (isStudent) {
        document.body.classList.add('in-student-view');
        document.body.classList.remove('in-admin-view');
        document.body.setAttribute('data-perspective', 'student');
      } else {
        document.body.classList.add('in-admin-view');
        document.body.classList.remove('in-student-view');
        document.body.setAttribute('data-perspective', 'admin');
      }

      // Hide or show Institutional Section and Divider in the master sidebar
      const instSection = document.getElementById('section-institutional');
      if (instSection) {
        if (isStudent) {
          instSection.classList.add('hidden');
        } else {
          instSection.classList.remove('hidden');
        }
      }

      const instDivider = document.getElementById('divider-institutional');
      if (instDivider) {
        if (isStudent) {
          instDivider.classList.add('hidden');
        } else {
          instDivider.classList.remove('hidden');
        }
      }

      // Hide or show Student Section in the master sidebar
      const studentSection = document.getElementById('section-student');
      if (studentSection) {
        if (isStudent) {
          studentSection.classList.remove('hidden');
        } else {
          studentSection.classList.add('hidden');
        }
      }

      // Hide or show + New Drive button in header
      const btnNewDrive = document.getElementById('btnNewDrive');
      if (btnNewDrive) {
        if (isStudent) {
          btnNewDrive.classList.add('!hidden');
          btnNewDrive.classList.remove('sm:flex');
        } else {
          btnNewDrive.classList.remove('!hidden');
          btnNewDrive.classList.add('sm:flex');
        }
      }

      // Update persona dropdown trigger icon and label
      const icon = document.getElementById('personaIcon');
      const label = document.getElementById('personaLabel');
      if (icon && label) {
        if (isStudent) {
          icon.textContent = 'school';
          label.textContent = 'Student Candidate View';
        } else {
          icon.textContent = 'manage_accounts';
          label.textContent = 'TPO Dean View';
        }
      }

      // Update active user profile card inside dropdown
      const personaAvatar = document.getElementById('personaAvatar');
      const personaName = document.getElementById('personaName');
      const personaRoleDesc = document.getElementById('personaRoleDesc');
      const personaSecurityTag = document.getElementById('personaSecurityTag');
      const btnSwitchPortalText = document.getElementById('btnSwitchPortalText');

      if (isStudent) {
        if (personaAvatar) { personaAvatar.textContent = 'AS'; personaAvatar.className = 'w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0'; }
        if (personaName) personaName.textContent = 'Ananya Sharma';
        if (personaRoleDesc) personaRoleDesc.textContent = 'B.Tech CMPN (Batch 2025)';
        if (personaSecurityTag) {
          personaSecurityTag.textContent = 'STUDENT WORKSPACE';
          personaSecurityTag.className = 'px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-semibold';
        }
        if (btnSwitchPortalText) btnSwitchPortalText.textContent = 'Switch to TPO Admin Portal';
      } else {
        if (personaAvatar) { personaAvatar.textContent = 'DV'; personaAvatar.className = 'w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0'; }
        if (personaName) personaName.textContent = 'Dr. Aris Vance';
        if (personaRoleDesc) personaRoleDesc.textContent = 'Head of Career Placements & TPO';
        if (personaSecurityTag) {
          personaSecurityTag.textContent = 'TPO GOVERNANCE';
          personaSecurityTag.className = 'px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 font-mono font-semibold';
        }
        if (btnSwitchPortalText) btnSwitchPortalText.textContent = 'Switch to Student Portal';
      }

      // Update brand link target
      const brandLink = document.getElementById('headerBrandLink');
      if (brandLink) {
        brandLink.setAttribute('href', isStudent ? '#/skill-profile' : '#/cohort-skills');
      }
    }

    // Alias mapping for backward compatibility with original stitch links
    const routeAliases = {
      'login': 'login',
      'portal-login': 'login',
      'signin': 'login',
      'auth': 'login',
      'cohort-skill-dashboard': 'cohort-skills',
      'cohort-heatmap': 'cohort-skills',
      'drive-management-allocation': 'drive-management',
      'drive-calendar': 'drive-management',
      'eligibility-talent-discovery': 'talent-discovery',
      'rule-engine': 'talent-discovery',
      'predictive-alerts-mentorship': 'cohort-skills',
      'predictive-alerts': 'cohort-skills',
      'fairness-and-accreditation': 'fairness-accreditation',
      'student-profiles-verification': 'skill-profile',
      'target-company-matrices': 'target-gaps',
      'target-companies-and-gaps': 'target-gaps',
      'mock-drive-reports': 'mock-reports',
      'remediation-roadmaps': 'learning-path',
      'learning-roadmap': 'learning-path',
      'my-drives-and-eligibility': 'my-drives',
      'privacy-dpdp-compliance': 'privacy-consent',
      'privacy-and-consent': 'privacy-consent'
    };

    function cleanRoute(r) {
      if (!r) return '';
      let str = r.trim();
      if (str.startsWith('#/')) return str.substring(2);
      if (str.startsWith('#')) return str.substring(1);
      if (str.startsWith('/')) return str.substring(1);
      return str;
    }

    function navigateRoute(targetRoute) {
      const clean = cleanRoute(targetRoute);
      const resolved = routeAliases[clean] || clean;
      if (routes.includes(resolved)) {
        window.location.hash = '#/' + resolved;
      }
    }

    function handleRoute() {
      let hash = cleanRoute(window.location.hash);
      if (!hash) {
        hash = (authLocked && !currentAuthRole) ? 'login' : 'cohort-skills';
      }
      const activeRoute = routeAliases[hash] || hash;
      let targetRoute = routes.includes(activeRoute) ? activeRoute : 'cohort-skills';

      // 1. If on login view: isolate and present full-screen view
      if (targetRoute === 'login') {
        document.body.classList.add('in-login-view');
        document.body.classList.remove('in-student-view', 'in-admin-view');
        const header = document.getElementById('masterHeader');
        const sidebar = document.getElementById('masterSidebar');
        const wrapper = document.getElementById('appLayoutWrapper');
        if (header) header.classList.add('hidden');
        if (sidebar) sidebar.classList.add('hidden');
        if (wrapper) {
          wrapper.classList.remove('lg:pl-64', 'xl:pl-72', 'pt-16');
          wrapper.classList.add('p-0');
        }
        routes.forEach(r => {
          const p = document.getElementById('view-' + r);
          if (p) {
            if (r === 'login') {
              p.classList.remove('hidden');
              window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
              p.classList.add('hidden');
            }
          }
        });
        return;
      }

      // 2. Non-login routes: restore master header and sidebar
      document.body.classList.remove('in-login-view');
      const header = document.getElementById('masterHeader');
      const sidebar = document.getElementById('masterSidebar');
      const wrapper = document.getElementById('appLayoutWrapper');
      if (header) header.classList.remove('hidden');
      if (sidebar) sidebar.classList.remove('hidden');
      if (wrapper) {
        wrapper.classList.add('lg:pl-64', 'xl:pl-72', 'pt-16');
        wrapper.classList.remove('p-0');
      }

      // 3. Strict Role-Based Route Guarding (Air-gapped data protection)
      if (authLocked) {
        if (currentAuthRole === 'student' && institutionalRoutes.includes(targetRoute)) {
          showToast('Access Denied: Institutional & TPO administrative records are restricted.', 'lock');
          window.location.hash = '#/skill-profile';
          return;
        }
        if (currentAuthRole === 'admin' && studentRoutes.includes(targetRoute)) {
          showToast('Access Restricted: Student personal data is isolated under DPDP 2023 air-gap.', 'shield');
          window.location.hash = '#/cohort-skills';
          return;
        }
        if (!currentAuthRole) {
          showToast('Session locked. Please authenticate to access portal data.', 'lock');
          window.location.hash = '#/login';
          return;
        }
      }

      // 4. Update UI perspective
      if (!authLocked) {
        const isStudent = studentRoutes.includes(targetRoute);
        updatePerspectiveUI(isStudent ? 'student' : 'admin');
      } else {
        updatePerspectiveUI(currentAuthRole === 'student' ? 'student' : 'admin');
      }

      // 5. Switch view panels
      routes.forEach(r => {
        const panel = document.getElementById('view-' + r);
        if (panel) {
          if (r === targetRoute) {
            panel.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'instant' });
          } else {
            panel.classList.add('hidden');
          }
        }
      });

      // 6. Update active state in sidebar
      document.querySelectorAll('.nav-item').forEach(el => {
        const routeAttr = el.getAttribute('data-route');
        if (routeAttr === targetRoute) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('DOMContentLoaded', handleRoute);

    // ==========================================
    // PERSONA / ROLE SWITCHER & AUTH HANDLERS
    // ==========================================
    function togglePersonaDropdown() {
      const menu = document.getElementById('personaMenu');
      if (menu) menu.classList.toggle('hidden');
    }

    function switchPersona(persona) {
      if (persona === 'dean' || persona === 'admin') {
        currentAuthRole = 'admin';
        updatePerspectiveUI('admin');
        showToast('Switched context: Dr. Aris Vance (TPO Dean)', 'admin_panel_settings');
        navigateRoute('cohort-skills');
      } else {
        currentAuthRole = 'student';
        updatePerspectiveUI('student');
        showToast('Switched context: Student Candidate View (Ananya Sharma)', 'school');
        navigateRoute('skill-profile');
      }
      const menu = document.getElementById('personaMenu');
      if (menu) menu.classList.add('hidden');
    }

    function switchToOppositeRole() {
      const menu = document.getElementById('personaMenu');
      if (menu) menu.classList.add('hidden');
      if (currentPerspective === 'student') {
        currentAuthRole = 'admin';
        updatePerspectiveUI('admin');
        window.location.hash = '#/cohort-skills';
        showToast('Switched to TPO Dean Administration Portal', 'admin_panel_settings');
      } else {
        currentAuthRole = 'student';
        updatePerspectiveUI('student');
        window.location.hash = '#/skill-profile';
        showToast('Switched to Student Candidate Portal (Ananya Sharma)', 'school');
      }
    }

    function signOut() {
      authLocked = true;
      currentAuthRole = null;
      const menu = document.getElementById('personaMenu');
      if (menu) menu.classList.add('hidden');
      window.location.hash = '#/login';
      showToast('Session securely terminated and locked.', 'logout');
    }

    // Login Portal Action Handlers
    function switchRole(role) {
      currentLoginTabRole = role;
      const tabStudent = document.getElementById('tab-student');
      const tabTpo = document.getElementById('tab-tpo');
      const roleTitle = document.getElementById('role-title-text');
      const roleDesc = document.getElementById('role-desc-text');
      const roleBadge = document.getElementById('role-badge-tag');
      const identityLabel = document.getElementById('identity-label');
      const userIdentity = document.getElementById('user-identity');
      const mfaSection = document.getElementById('mfa-section');
      const submitBtnText = document.getElementById('btn-text');

      if (role === 'student') {
        if (tabStudent) {
          tabStudent.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm flex items-center gap-1.5';
          tabStudent.setAttribute('aria-selected', 'true');
        }
        if (tabTpo) {
          tabTpo.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
          tabTpo.setAttribute('aria-selected', 'false');
        }
        if (roleTitle) roleTitle.textContent = 'Candidate Workspace Access';
        if (roleDesc) roleDesc.textContent = 'Encrypted personal skill vault, mock drive diagnostics & private consent tokens';
        if (roleBadge) {
          roleBadge.textContent = 'STUDENT SCOPE';
          roleBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200';
        }
        if (identityLabel) identityLabel.textContent = 'VESIT Student Roll Number or University Email';
        if (userIdentity) {
          userIdentity.placeholder = 'ananya.sharma@ves.ac.in';
          userIdentity.value = 'ananya.sharma@ves.ac.in';
        }
        if (mfaSection) mfaSection.classList.add('hidden');
        if (submitBtnText) submitBtnText.textContent = 'Authenticate & Enter Student Workspace';
      } else {
        if (tabTpo) {
          tabTpo.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-sm flex items-center gap-1.5';
          tabTpo.setAttribute('aria-selected', 'true');
        }
        if (tabStudent) {
          tabStudent.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
          tabStudent.setAttribute('aria-selected', 'false');
        }
        if (roleTitle) roleTitle.textContent = 'Institutional & TPO Administration';
        if (roleDesc) roleDesc.textContent = 'Campus recruitment orchestrator, NAAC/NIRF compliance & AST cohort intelligence';
        if (roleBadge) {
          roleBadge.textContent = 'TPO GOVERNANCE';
          roleBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200';
        }
        if (identityLabel) identityLabel.textContent = 'VESIT Institutional Administrator ID or Dean Email';
        if (userIdentity) {
          userIdentity.placeholder = 'aris.vance@ves.ac.in';
          userIdentity.value = 'aris.vance@ves.ac.in';
        }
        if (mfaSection) mfaSection.classList.remove('hidden');
        if (submitBtnText) submitBtnText.textContent = 'Authenticate & Enter TPO Admin Operations';
      }
    }

    function handleLogin(e) {
      if (e && e.preventDefault) e.preventDefault();
      const submitBtn = document.getElementById('submit-login-btn');
      const origContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Verifying Cryptographic Tokens...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origContent;
        }
        authLocked = true;
        if (currentLoginTabRole === 'student') {
          currentAuthRole = 'student';
          updatePerspectiveUI('student');
          window.location.hash = '#/skill-profile';
          showToast('Authenticated: Ananya Sharma (Student Workspace)', 'verified');
        } else {
          currentAuthRole = 'admin';
          updatePerspectiveUI('admin');
          window.location.hash = '#/cohort-skills';
          showToast('Authenticated: Dr. Aris Vance (TPO Governance)', 'admin_panel_settings');
        }
      }, 500);
    }

    function handleGoogleSSO() {
      authLocked = true;
      if (currentLoginTabRole === 'student') {
        currentAuthRole = 'student';
        updatePerspectiveUI('student');
        window.location.hash = '#/skill-profile';
        showToast('Google Workspace SSO: ananya.sharma@ves.ac.in verified!', 'verified');
      } else {
        currentAuthRole = 'admin';
        updatePerspectiveUI('admin');
        window.location.hash = '#/cohort-skills';
        showToast('Google Workspace SSO: aris.vance@ves.ac.in verified!', 'admin_panel_settings');
      }
    }

    function handleSamlSSO() {
      authLocked = true;
      if (currentLoginTabRole === 'student') {
        currentAuthRole = 'student';
        updatePerspectiveUI('student');
        window.location.hash = '#/skill-profile';
        showToast('VESIT Shibboleth SAML 2.0 Verified (Student: Ananya Sharma)', 'verified');
      } else {
        currentAuthRole = 'admin';
        updatePerspectiveUI('admin');
        window.location.hash = '#/cohort-skills';
        showToast('VESIT Shibboleth SAML 2.0 Verified (TPO Dean: Dr. Aris Vance)', 'admin_panel_settings');
      }
    }

    function handleForgotPassword() {
      showToast('VESIT Self-Service Password Reset link dispatched to registered institutional contact.', 'mark_email_read');
    }

    function verifyFidoToken() {
      showToast('FIDO2 WebAuthn / Hardware Key cryptographically verified (mum-in-vesit-prod-01).', 'security');
    }

    function togglePasswordVisibility() {
      const pwd = document.getElementById('user-password');
      if (pwd) {
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
      }
    }

    function openLoginHelpDesk() {
      openModal('modal-helpdesk');
    }

    function openCandidateDossier() {
      openCandidateDrawer('Ananya Sharma', 'B.Tech CMPN', '8.84', 'TPO Verified');
    }

    // Close persona dropdown when clicking outside
    document.addEventListener('click', function(e) {
      const btn = document.getElementById('personaToggleBtn');
      const menu = document.getElementById('personaMenu');
      if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });

    // ==========================================
    // NOTIFICATIONS DRAWER
    // ==========================================
    function toggleNotificationsDrawer() {
      const backdrop = document.getElementById('notificationsBackdrop');
      const panel = document.getElementById('notificationsPanel');
      if (!backdrop || !panel) return;

      const isHidden = backdrop.classList.contains('hidden');
      if (isHidden) {
        backdrop.classList.remove('hidden');
        setTimeout(() => backdrop.classList.add('opacity-100'), 10);
        panel.classList.remove('translate-x-full');
      } else {
        backdrop.classList.remove('opacity-100');
        panel.classList.add('translate-x-full');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
      }
    }

    // ==========================================
    // CANDIDATE QUICK DRAWER
    // ==========================================
    function openCandidateDrawer(name = 'Ananya Sharma', branch = 'B.Tech CMPN', cgpa = '8.84', verified = 'TPO Verified') {
      const backdrop = document.getElementById('candidateBackdrop');
      const panel = document.getElementById('candidatePanel');
      if (!backdrop || !panel) return;

      document.getElementById('candidateDrawerName').textContent = name;
      document.getElementById('candidateDrawerMeta').textContent = \`\${branch} • Batch 2025 • CGPA \${cgpa}\`;
      document.getElementById('candidateDrawerBadge').textContent = verified;

      backdrop.classList.remove('hidden');
      setTimeout(() => backdrop.classList.add('opacity-100'), 10);
      panel.classList.remove('translate-x-full');
    }

    function closeCandidateDrawer() {
      const backdrop = document.getElementById('candidateBackdrop');
      const panel = document.getElementById('candidatePanel');
      if (!backdrop || !panel) return;

      backdrop.classList.remove('opacity-100');
      panel.classList.add('translate-x-full');
      setTimeout(() => backdrop.classList.add('hidden'), 300);
    }

    // ==========================================
    // MODAL HELPERS
    // ==========================================
    function openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('hidden');
      }
    }

    function closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('hidden');
      }
    }

    // Global ESC to close modals
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        const notifBackdrop = document.getElementById('notificationsBackdrop');
        if (notifBackdrop && !notifBackdrop.classList.contains('hidden')) {
          toggleNotificationsDrawer();
        }
        closeCandidateDrawer();
      }
      // Ctrl+K / Cmd+K for OmniSearch
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openModal('modal-omnisearch');
        setTimeout(() => {
          const inp = document.getElementById('omniSearchQuery');
          if (inp) inp.focus();
        }, 100);
      }
    });

    // Close on backdrop click for all modals
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    });

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    let toastTimeout = null;
    function showToast(msg, icon = 'check_circle') {
      const toast = document.getElementById('toastNotification');
      const toastMessage = document.getElementById('toastMessage');
      const toastIcon = document.getElementById('toastIcon');
      if (!toast) return;

      if (toastMessage) toastMessage.textContent = msg;
      if (toastIcon) toastIcon.textContent = icon;

      toast.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      toast.classList.add('opacity-100', 'translate-y-0');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
      }, 3500);
    }

    // Alias for original triggerToast
    function triggerToast(msg) {
      showToast(msg, 'verified');
    }

    // ==========================================
    // ACTION HANDLERS FOR ALL BUTTONS
    // ==========================================

    // 1. AST Rescan
    function triggerAstRescan() {
      const icon = document.getElementById('rescanIcon');
      const text = document.getElementById('rescanText');
      const btn = document.getElementById('rescanTriggerBtn');
      if (icon) icon.classList.add('animate-spin');
      if (text) text.textContent = 'Scanning AST Nodes...';
      if (btn) btn.disabled = true;

      setTimeout(() => {
        if (icon) icon.classList.remove('animate-spin');
        if (text) text.textContent = 'Trigger AST Rescan';
        if (btn) btn.disabled = false;
        showToast('AST Rescan Complete: 807 Student Repositories Synchronized.', 'cloud_done');

        const auditLog = document.getElementById('agentAuditLog');
        if (auditLog) {
          const entry = document.createElement('div');
          entry.className = 'flex items-center justify-between text-on-surface-variant p-1.5 rounded hover:bg-slate-50';
          entry.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-on-surface-variant font-semibold">Just Now</span>
              <span class="px-1 py-0.2 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold">MANUAL_AST_RESCAN</span>
              <span>Manual re-trigger executed by Dr. Aris Vance. Zero discrepancies flagged in 807 profiles.</span>
            </div>
            <span class="text-emerald-700 font-semibold">[AUDIT PASS]</span>
          \`;
          auditLog.prepend(entry);
        }
      }, 1200);
    }

    // 2. Heatmap cell selection
    function selectHeatmapCell(branch, topic, percent, vendor, syllabus, count) {
      const remedySubtext = document.getElementById('remedySubtext');
      const remedyTitle = document.getElementById('remedyTitle');
      const bookBtn = document.getElementById('bookWorkshopBtn');

      if (remedySubtext) remedySubtext.textContent = \`\${branch} 2025 • \${percent} weak in \${topic} (\${count} Students)\`;
      if (remedyTitle) remedyTitle.textContent = \`Prescribed Remedy: High-Intensity Workshop on \${syllabus}\`;
      if (bookBtn) {
        bookBtn.innerHTML = \`<span class="material-symbols-outlined text-[18px]">bolt</span><span>⚡ Book Expert \${topic} Workshop (\${vendor})</span>\`;
      }
      showToast(\`Loaded suggested institutional remedy for \${branch} \${topic}\`, 'auto_fix_high');
    }

    function confirmWorkshopBooking() {
      showToast('Workshop authorized & calendar invite drafted for VESIT Academic Council.', 'task_alt');
      const bookBtn = document.getElementById('bookWorkshopBtn');
      if (bookBtn) {
        bookBtn.textContent = '✓ Booking Submitted to HOD Office';
        bookBtn.classList.remove('bg-primary');
        bookBtn.classList.add('bg-emerald-700');
      }
    }

    // 3. Early Warning student intervention
    function approveStudentIntervention(rowId, name, selectId) {
      const row = document.getElementById(rowId);
      const selectElem = document.getElementById(selectId);
      const assignedMentor = selectElem ? selectElem.value : 'Dr. Aris Vance';

      if (row) {
        row.style.transition = 'all 0.4s ease';
        row.style.background = '#f2f3ff';
        const actionTd = row.querySelector('td:last-child');
        if (actionTd) {
          actionTd.innerHTML = \`<span class="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-bold">Assigned: \${assignedMentor}</span>\`;
        }
      }
      showToast(\`1-on-1 Mentorship confirmed for \${name} with \${assignedMentor}.\`, 'how_to_reg');
    }

    function dismissStudentFlag(rowId) {
      const row = document.getElementById(rowId);
      if (row) {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '0';
        setTimeout(() => {
          row.remove();
          showToast('Early warning flag dismissed from active queue.', 'remove_circle_outline');
        }, 300);
      }
    }

    function applyBootcampDecision() {
      const btn = document.getElementById('addBootcampBtn');
      if (btn) {
        btn.innerHTML = \`<span class="material-symbols-outlined text-[18px]">done_all</span><span>✓ Docker 3-Day Boot Added to Academic Calendar (Q4)</span>\`;
        btn.classList.remove('bg-primary');
        btn.classList.add('bg-emerald-700');
      }
      showToast('Bootcamp officially slotted. Syllabus dispatched to 142 affected students.', 'verified');
    }

    function ignoreDockerRecommendation() {
      showToast('Recommendation acknowledged and archived.', 'archive');
    }

    // 4. Drive Creation
    function handleCreateDrive(e) {
      e.preventDefault();
      const comp = document.getElementById('driveCompany').value;
      const ctc = document.getElementById('driveCtc').value;
      const fac = document.getElementById('driveFacility').value;
      closeModal('modal-new-drive');
      showToast(\`New Campus Drive published for \${comp} (\${ctc}) in \${fac} with 0 clashes!\`, 'task_alt');
      navigateRoute('drive-management');
    }

    function dispatchOutreachCampaign() {
      closeModal('modal-outreach');
      showToast('Campaign successfully dispatched to 48 Tier-1 Recruiters via Proofpoint Gateway!', 'send');
    }

    // 5. Accreditation Exports
    function downloadAccreditationPDF() {
      closeModal('modal-accreditation');
      showToast('Synthesizing Signed NAAC Criterion 5.2.1 PDF...', 'picture_as_pdf');
      const fakeContent = "VESIT NAAC CRITERION 5.2.1 REPORT\\nYear: 2024-2025\\nPlacement Rate: 92.4%\\nAIR Gender Parity: 0.96\\nCryptographic Signature: #0xVESIT-NAAC-8842-VALID\\n";
      const blob = new Blob([fakeContent], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'VESIT_NAAC_Criterion_5_2_1_Verified.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function downloadAccreditationCSV() {
      closeModal('modal-accreditation');
      showToast('Downloading NAAC Criterion 5.2.1 Master Excel Data...', 'table_view');
      const csv = "Metric,Verified_Score,Benchmark,Status\\nPlacement_Percentage,92.4%,85.0%,Exceeded\\nAIR_Gender,0.96,0.80,Compliant\\nAST_Verification_Rate,94.2%,80.0%,Exceeded\\n";
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'VESIT_NAAC_5_2_1_Data.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // 6. Placement Appeal
    function openAppealModal(driveTitle, ruleInfo) {
      const modalDriveTitle = document.getElementById('modal-drive-name');
      const modalRuleRef = document.getElementById('modal-rule-ref');
      if (modalDriveTitle) modalDriveTitle.innerText = driveTitle;
      if (modalRuleRef) modalRuleRef.innerText = ruleInfo;
      const modal = document.getElementById('appeal-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeAppealModal() {
      const modal = document.getElementById('appeal-modal');
      if (modal) modal.classList.add('hidden');
    }

    function submitAppealAction() {
      const btn = event.target;
      btn.innerText = 'Transmitting...';
      setTimeout(() => {
        btn.innerText = 'Appeal Lodged ✓';
        showToast('Appeal transmitted to VESIT T&P Appellate Board with SHA cryptographic proof.', 'verified');
        setTimeout(() => {
          closeAppealModal();
          btn.innerText = 'Submit Formally to T&P';
        }, 1000);
      }, 700);
    }

    // 7. Student Skill Filtering & Proofs
    function filterSkills(status) {
      const tabs = document.querySelectorAll('.skill-tab');
      tabs.forEach(tab => {
        tab.classList.remove('bg-surface-container-lowest', 'text-brand-navy', 'shadow-sm', 'font-semibold', 'border', 'border-slate-200');
        tab.classList.add('text-on-surface-variant', 'font-medium');
      });

      if (event && event.currentTarget) {
        event.currentTarget.classList.add('bg-surface-container-lowest', 'text-brand-navy', 'shadow-sm', 'font-semibold', 'border', 'border-slate-200');
        event.currentTarget.classList.remove('text-on-surface-variant', 'font-medium');
      }

      const items = document.querySelectorAll('.skill-item');
      items.forEach(item => {
        if (status === 'all') {
          item.style.display = 'flex';
        } else if (item.classList.contains(status)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    }

    function openProofModal(type) {
      const modal = document.getElementById('proof-modal');
      const title = document.getElementById('modal-title');
      const input = document.getElementById('proof-input');
      if (!modal) return;
      if (type === 'file') {
        if (title) title.innerText = 'Upload Official Certificate / Proof';
        if (input) input.placeholder = 'Select PDF, Transcripts, or JSON key bundle...';
      } else {
        if (title) title.innerText = 'Attach Credential URL';
        if (input) input.placeholder = 'https://www.credly.com/badges/... or git commit SHA';
      }
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function openRetestModal(skillName) {
      const modal = document.getElementById('proof-modal');
      const title = document.getElementById('modal-title');
      const desc = document.getElementById('modal-desc');
      const input = document.getElementById('proof-input');
      if (!modal) return;
      if (title) title.innerText = \`Re-Test / Renew Credential: \${skillName}\`;
      if (desc) desc.innerText = \`To reinstate \${skillName} as Verified, submit your renewed credential URL or book a 30-minute proctored live evaluation via Proofpoint Agent.\`;
      if (input) input.placeholder = \`Enter renewed ID or type 'BOOK_PROCTORED_LAB'\`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function requestVerification(skillName) {
      openRetestModal(skillName);
    }

    function closeModalHandler() {
      const modal = document.getElementById('proof-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function submitProof() {
      closeModalHandler();
      showToast('Proofpoint Agent ingested proof. Hash verification queued for pipeline v5.0.4.', 'cloud_done');
    }

    // 8. Code Diff Patch
    function applyCodePatch() {
      closeModal('modal-code-diff');
      showToast('Patch applied: Window partition boundary logic updated with NULLS LAST.', 'check_circle');
    }

    // 9. Interactive Sandbox
    function runSandboxQuery() {
      const output = document.getElementById('sandboxOutput');
      if (output) {
        output.classList.remove('hidden');
        showToast('Query executed successfully in 3.8ms!', 'task_alt');
      }
    }

    function submitSandboxSolution() {
      closeModal('modal-sandbox');
      showToast('Solution verified by AST Engine! Added 25 points to SQL Mastery.', 'military_tech');
    }

    // 10. Code Review
    function confirmCodeReviewBooking() {
      closeModal('modal-code-review');
      showToast('1:1 Code Review booked for Wednesday 4:30 PM with Ketan K. (Proofpoint Alumni)!', 'event_available');
    }

    // 11. Data Purge
    function executeDataPurge() {
      const inp = document.getElementById('purgeConfirmInput').value;
      if (inp === 'CONFIRM_PURGE') {
        closeModal('modal-dpdp-erase');
        showToast('DPDP Erasure Request Lodged: Personal telemetry marked for cryptographic purge.', 'delete_sweep');
      } else {
        alert('Please type CONFIRM_PURGE to verify intention.');
      }
    }

    // 12. OmniSearch Filter Handler
    function handleOmniSearch(query) {
      const q = query.toLowerCase().trim();
      const results = document.getElementById('omniSearchResults');
      if (!results) return;

      const items = results.children;
      for (let i = 0; i < items.length; i++) {
        const text = items[i].textContent.toLowerCase();
        if (!q || text.includes(q)) {
          items[i].style.display = 'flex';
        } else {
          items[i].style.display = 'none';
        }
      }
    }

    // 13. Mobile sidebar toggle
    function toggleMobileSidebar() {
      const sidebar = document.getElementById('masterSidebar');
      if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
      }
    }

    // 14. Global wire-up for all buttons across views on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
      // Setup candidate row clicks in talent discovery
      document.querySelectorAll('#view-talent-discovery tbody tr, #view-talent-discovery .candidate-card').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
          const nameEl = this.querySelector('h3, .font-bold, .candidate-name');
          const name = nameEl ? nameEl.textContent.trim() : 'Candidate';
          if (name.includes('Ananya')) {
            navigateRoute('skill-profile');
          } else {
            openCandidateDrawer(name, 'B.Tech CMPN', '8.72', 'TPO Verified');
          }
        });
      });

      // Hook up resume gen button
      const resumeBtn = document.getElementById('resume-gen-btn');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', function() {
          this.disabled = true;
          const orig = this.innerHTML;
          this.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Synthesizing Tailored Resume...</span>';
          setTimeout(() => {
            this.disabled = false;
            this.innerHTML = orig;
            showToast('⚡ Tailored resume generated with verified SHA metadata! Ready in Documents.', 'description');
          }, 1200);
        });
      }

      // Wire up any buttons with specific labels across views
      document.querySelectorAll('button').forEach(btn => {
        const txt = btn.textContent.trim();
        if (txt.includes('Export Master Roster')) {
          btn.addEventListener('click', () => downloadAccreditationCSV());
        } else if (txt.includes('Export Statutory Accreditation Pack') || txt.includes('Export Statutory Scope')) {
          btn.addEventListener('click', () => openModal('modal-accreditation'));
        } else if (txt.includes('Dispatch Recruiter Campaign') || txt.includes('Recruiter Outreach')) {
          btn.addEventListener('click', () => openModal('modal-outreach'));
        } else if (txt.includes('Fix Query') || txt.includes('View Edge Case')) {
          btn.addEventListener('click', () => openModal('modal-code-diff'));
        } else if (txt.includes('Audio Replay')) {
          btn.addEventListener('click', () => openModal('modal-audio-replay'));
        } else if (txt.includes('Toggle AI Proctor Telemetry Log')) {
          btn.addEventListener('click', () => openModal('modal-telemetry'));
        } else if (txt.includes('Start SQL Practice Drills') || txt.includes('Start Practice Drills')) {
          btn.addEventListener('click', () => openModal('modal-sandbox'));
        } else if (txt.includes('View Benchmark Specs & Rubric') || txt.includes('View Project Spec & Proctor')) {
          btn.addEventListener('click', () => openModal('modal-project-spec'));
        } else if (txt.includes('Request 1:1 Code Review')) {
          btn.addEventListener('click', () => openModal('modal-code-review'));
        } else if (txt.includes('Download Learning Roadmap PDF') || txt.includes('Download Certified Report PDF')) {
          btn.addEventListener('click', () => {
            showToast('Generating official Proofpoint certified PDF...', 'picture_as_pdf');
            downloadAccreditationPDF();
          });
        } else if (txt.includes('Enroll All 3 Modules') || txt.includes('Bridge Gap in 48h') || txt.includes('Start 48-Hour Recovery Sprint')) {
          btn.addEventListener('click', () => {
            showToast('Enrolled in 48-Hour Recovery Sprint!', 'alt_route');
            navigateRoute('learning-path');
          });
        } else if (txt.includes('Apply with 1-Click Resume') || txt.includes('Apply Now')) {
          btn.addEventListener('click', function() {
            this.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span><span>Applied • Slot Confirmed</span>';
            this.classList.remove('bg-brand-navy', 'hover:bg-slate-900');
            this.classList.add('bg-emerald-700', 'text-white');
            showToast('Application submitted with Proofpoint AST verified credentials!', 'verified');
          });
        } else if (txt.includes('Start 20m Lab Validation')) {
          btn.addEventListener('click', () => openModal('modal-sandbox'));
        } else if (txt.includes('Proofpoint Explainability Whitepaper')) {
          btn.addEventListener('click', () => openModal('modal-whitepaper'));
        } else if (txt.includes('Initiate Right to Erasure Request')) {
          btn.addEventListener('click', () => openModal('modal-dpdp-erase'));
        } else if (txt.includes('Request Full Data Archive (JSON)')) {
          btn.addEventListener('click', () => {
            showToast('Compiling complete DPDP JSON telemetry archive...', 'download');
            const data = { tenant: 'VESIT', candidate: 'Ananya Sharma', ast_score: 94.2, timestamp: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'VESIT_DPDP_Data_Archive_Ananya_Sharma.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
          });
        } else if (txt.includes('Withdraw GitHub Access') || txt.includes('Withdraw LeetCode Access') || txt.includes('Withdraw HackerRank Access')) {
          btn.addEventListener('click', function() {
            showToast('Access revoked under DPDP mandate. Telemetry sync suspended.', 'link_off');
            this.textContent = 'Access Revoked ✓';
            this.classList.add('opacity-50');
          });
        } else if (txt.includes('All Tiers') || txt.includes('Tier-1 FAANG+') || txt.includes('Fintech Unicorns')) {
          btn.addEventListener('click', function() {
            showToast(\`Filter applied: \${txt}\`, 'filter_alt');
          });
        }
      });
    });
  </script>
</body>
</html>
`;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/index.html', masterHtml, 'utf8');
console.log('Successfully built public/index.html. Total length:', masterHtml.length);
