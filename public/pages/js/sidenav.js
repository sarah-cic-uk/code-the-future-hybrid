const template = document.createElement("template");

template.innerHTML = `
<div class="col-auto px-sm-2 px-0 side-navigation" id="side-navigation" style="color: white">
  <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2">
    <ul class="nav flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
      <li class="nav-item pb-2">
        <button href="#submenu1" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session1">
          <i class="fs-4 bi-github"></i>
          <span class="ms-3 d-none d-sm-inline">Session 1</span>
          <span id="session1-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session1/introduction.html')" class="nav-link p-0" name="session1-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/introIDE.html')"
              class="nav-link p-0" name="introIDE">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Laptop setup</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/introGit.html')"
              class="nav-link p-0" name="introGit">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Intro to Git</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/firstRepo.html')"
              class="nav-link p-0" name="firstRepo">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">First repo</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/hostingGithub.html')"
              class="nav-link p-0" name="hostingGithub">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Hosting on GitHub</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/gitVScode.html')"
              class="nav-link p-0" name="gitVScode">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Using Git in VScode</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/gitTerminal.html')"
              class="nav-link p-0" name="gitTerminal">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Git & the Terminal</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/githubDesktop.html')"
              class="nav-link p-0" name="githubDesktop">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">GitHub Desktop</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session1/lessons/gitBranchConflicts.html')"
              class="nav-link p-0" name="gitBranchConflicts">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Git branches / conflicts</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu2" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session2">
          <i class="fs-4 bi-window-sidebar"></i>
          <span class="ms-3 d-none d-sm-inline">Session 2</span>
          <span id="session2-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu2" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session2/introduction.html')" class="nav-link p-0" name="session2-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session2/lessons/htmlBasics.html')"
              class="nav-link p-0" name="htmlBasics">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">HTML Basics</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session2/lessons/firstWebpage.html')"
              class="nav-link p-0" name="firstWebpage">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">First Webpage</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session2/lessons/chromeDevTools.html')"
              class="nav-link p-0" name="chromeDevTools">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Using Dev Tools</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu3" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session3">
          <i class="fs-4 bi-code-square"></i>
          <span class="ms-3 d-none d-sm-inline">Session 3</span>
          <span id="session3-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu3" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session3/introduction.html')" class="nav-link p-0" name="session3-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_images.html')"
              class="nav-link p-0" name="html_images">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Images</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_tables.html')"
              class="nav-link p-0" name="html_tables">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Tables</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_forms.html')"
              class="nav-link p-0" name="html_forms">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Forms & Validation</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_hyperlinks.html')"
              class="nav-link p-0" name="html_hyperlinks">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Hyperlinks & Multi-page sites</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu4" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session4">
          <i class="fs-4 bi-border-style"></i>
          <span class="ms-3 d-none d-sm-inline">Session 4</span>
          <span id="session4-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu4" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session4/introduction.html')" class="nav-link p-0" name="session4-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session4/lessons/introToCSS.html')"
              class="nav-link p-0" name="introToCSS">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Intro to CSS</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session4/lessons/layoutsInCSS.html')"
              class="nav-link p-0" name="layoutsInCSS">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Layouts in CSS</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session4/lessons/advancedCSS.html')"
              class="nav-link p-0" name="advancedCSS">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Advanced CSS</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session4/lessons/cssActivities.html')"
              class="nav-link p-0" name="cssActivities">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">CSS activity</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu5" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session5">
          <i class="fs-4 bi-tools"></i>
          <span class="ms-3 d-none d-sm-inline">Session 5</span>
          <span id="session5-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu5" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session5/introduction.html')" class="nav-link p-0" name="session5-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibility.html')"
              class="nav-link p-0" name="accessibility">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Intro to Accessibility</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibilityTools.html')"
              class="nav-link p-0" name="accessibilityTools">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Accessibility tools</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibilityExample.html')"
              class="nav-link p-0" name="accessibilityExample">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Real-World example</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu6" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session6">
          <i class="fs-4 bi-easel"></i>
          <span class="ms-3 d-none d-sm-inline">Showcase</span>
          <span id="session6-tooltip" class="box tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu6" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session6/introduction.html')" class="nav-link p-0" name="session6-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session6/lessons/projectPlanning.html')"
              class="nav-link p-0" name="projectPlanning">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Project Planning</span></a>
          </li>
          <li>
          <a href="#" onclick="createPath('pages/sessions/session6/lessons/additionalHelp.html')"
            class="nav-link p-0" name="additionalHelp">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Additional help</span></a>
        </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <button href="#submenu7" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session7">
          <i class="fs-4 bi-cpu"></i>
          <span class="ms-3 d-none d-sm-inline">AI Session</span>
          <i class="bi bi-three-dots ms-2 d-none d-sm-inline" title="Optional bonus session"></i>
          <span id="session7-tooltip" class="tooltip-text hidden">Session Opens Soon</span>
        </button>
        <ul class="collapse nav flex-column ms-1" id="submenu7" data-bs-parent="#menu">
          <li class="w-100">
            <a href="#" onclick="createPath('pages/sessions/session7/introduction.html')" class="nav-link p-0" name="session7-overview">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Overview</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/goodUses.html')" class="nav-link p-0" name="goodUses">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">What AI is good for</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/humanFirst.html')" class="nav-link p-0" name="humanFirst">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Why humans still matter</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/promptPractice.html')" class="nav-link p-0" name="promptPractice">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Prompt practice</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/modelsTokensCosts.html')" class="nav-link p-0" name="modelsTokensCosts">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Models, tokens and costs</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/reviewAndRepeat.html')" class="nav-link p-0" name="reviewAndRepeat">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Review and repeat</span></a>
          </li>
          <li>
            <a href="#" onclick="createPath('pages/sessions/session7/lessons/furtherLearning.html')" class="nav-link p-0" name="furtherLearning">
              <i class="fs-4 bi-dash"></i>
              <span class="d-none d-sm-inline">Further learning</span></a>
          </li>
        </ul>
      </li>
      <li class="nav-item pb-2">
        <a href="#" onclick="createPath('index.html')" 
          data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="exitSession">
          <i class="fs-4 bi-box-arrow-left"></i>
          <span class="ms-3 d-none d-sm-inline">Exit Sessions</span>
        </a>
      </li>
    </ul>
  </div>
</div>
`;

document.querySelector(".page-content").prepend(template.content);

document.addEventListener("DOMContentLoaded", async () => {
  // Paint the base to-do icons immediately, then overlay completion in the
  // background so the sidenav shows instantly without waiting on the network.
  initSideNavIcons();
  updateSideNavCompletionStatus();
});

async function waitForAuth() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 5000);
  });
}

const SIDENAV_ALL_LESSONS = {
  session1: [
    "session1-overview",
    "introIDE",
    "introGit",
    "firstRepo",
    "hostingGithub",
    "gitVScode",
    "gitTerminal",
    "githubDesktop",
  ],
  session2: ["session2-overview", "htmlBasics", "firstWebpage", "chromeDevTools"],
  session3: [
    "session3-overview",
    "html_images",
    "html_tables",
    "html_forms",
    "html_hyperlinks",
  ],
  session4: [
    "session4-overview",
    "introToCSS",
    "layoutsInCSS",
    "advancedCSS",
    "cssActivities",
  ],
  session5: [
    "session5-overview",
    "accessibility",
    "accessibilityTools",
    "accessibilityExample",
  ],
  session6: ["session6-overview", "projectPlanning", "additionalHelp"],
  session7: [
    "session7-overview",
    "goodUses",
    "humanFirst",
    "promptPractice",
    "modelsTokensCosts",
    "reviewAndRepeat",
    "furtherLearning",
  ],
};

const SIDENAV_OPTIONAL_LESSONS = {
  session1: ["githubDesktop", "gitBranchConflicts"],
  session5: ["accessibilityExample"],
  session7: ["furtherLearning"],
};

// Whole sessions that are optional (a "bonus" the student doesn't need for
// course completion). Keep in sync with cohort-management.js OPTIONAL_SESSIONS.
const SIDENAV_OPTIONAL_SESSIONS = ["session7"];

// All lessons shown under a session in the side nav (including optional-only
// ones such as gitBranchConflicts that aren't tracked for completion), minus
// the overview link, which is a section intro rather than a lesson.
function sideNavLessonNames(session) {
  return [...new Set([
    ...(SIDENAV_ALL_LESSONS[session] || []),
    ...(SIDENAV_OPTIONAL_LESSONS[session] || []),
  ])].filter((name) => !name.endsWith('-overview'));
}

// A lesson is optional if its whole session is a bonus, or it's individually
// flagged optional within its session.
function isSideNavOptionalLesson(session, lessonName) {
  return SIDENAV_OPTIONAL_SESSIONS.includes(session) ||
    (SIDENAV_OPTIONAL_LESSONS[session] || []).includes(lessonName);
}

// Icon language for the side nav (matches the lesson pages):
//   required to-do → white tick        (bi-check-circle)
//   optional to-do → white three-dots  (bi-three-dots)
//   done           → green tick        (bi-check-circle text-success)
// White icons inherit the nav-link colour, so they highlight pink on hover.
function sideNavIconClass(isOptional, isDone) {
  if (isDone) return 'fs-4 bi-check-circle text-success';
  return 'fs-4 ' + (isOptional ? 'bi-three-dots' : 'bi-check-circle');
}

// Paint the base (to-do) icons synchronously so there's no flash and the icons
// are correct even before progress loads / when logged out.
function initSideNavIcons() {
  for (const session of Object.keys(SIDENAV_ALL_LESSONS)) {
    sideNavLessonNames(session).forEach((lessonName) => {
      const el = document.querySelector(`[name="${lessonName}"]`);
      const icon = el && el.querySelector('i');
      if (icon) icon.className = sideNavIconClass(isSideNavOptionalLesson(session, lessonName), false);
    });
  }
}

async function updateSideNavCompletionStatus() {
  if (!localStorage.getItem('userEmail') || typeof window.getAllProgress !== 'function') return;

  // Fetch the user's full progress ONCE (a single GraphQL query) instead of
  // querying per-session. The previous nested loop issued ~56 duplicate
  // queries (plus a config fetch each), which flooded the page with requests.
  let allProgress = {};
  try {
    allProgress = await window.getAllProgress();
  } catch (error) {
    console.error('Error loading progress for side nav:', error);
    return;
  }

  for (const session of Object.keys(SIDENAV_ALL_LESSONS)) {
    const completed = new Set(Object.keys(allProgress[session]?.completedLessons || {}));

    // Turn completed lessons green (tick for required, filled star for optional).
    sideNavLessonNames(session).forEach((lessonName) => {
      if (!completed.has(lessonName)) return;
      const el = document.querySelector(`[name="${lessonName}"]`);
      if (!el) return;
      const icon = el.querySelector('i');
      const label = el.querySelector('span');
      if (icon) icon.className = sideNavIconClass(isSideNavOptionalLesson(session, lessonName), true);
      if (label) label.classList.add('text-success');
    });

    // Mark the whole session complete when all of its lessons that count toward
    // that session are done. The overview and individually-optional lessons are
    // excluded; a bonus session still ticks once its core lessons are finished.
    const requiredLessons = (SIDENAV_ALL_LESSONS[session] || []).filter(
      (name) =>
        !(SIDENAV_OPTIONAL_LESSONS[session] || []).includes(name) &&
        !name.endsWith('-overview')
    );
    const isSessionComplete =
      requiredLessons.length > 0 &&
      requiredLessons.every((name) => completed.has(name));

    if (isSessionComplete) {
      const sessionBtn = document.querySelector(`button[name="${session}"]`);
      if (sessionBtn) {
        const icon = sessionBtn.querySelector('i');
        const label = sessionBtn.querySelector('span');
        if (icon) icon.className = 'fs-4 bi-check-circle-fill text-success';
        if (label) label.classList.add('text-success');
      }
    }
  }
}

// Expose the lesson lists so other scripts (e.g. progressTracking.js's session
// status indicator) use the same source of truth as the side-nav ticks.
window.SIDENAV_ALL_LESSONS = SIDENAV_ALL_LESSONS;
window.SIDENAV_OPTIONAL_LESSONS = SIDENAV_OPTIONAL_LESSONS;
window.SIDENAV_OPTIONAL_SESSIONS = SIDENAV_OPTIONAL_SESSIONS;
