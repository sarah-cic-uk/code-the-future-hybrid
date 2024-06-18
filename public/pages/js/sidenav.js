const template = document.createElement('template');

template.innerHTML = `
<a href="#main" class="skip-to-main-content-link">Skip to main content</a>
<div class="col-auto px-sm-2 px-0 side-navigation" id="side-navigation" style="color: white">
<div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2">
  <ul class="nav flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
    <li class="nav-item pb-2">
      <button href="#submenu1" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session1" title="Session 1">
        <i class="fs-4 bi-github"></i>
        <span class="ms-3 d-none d-sm-inline">Session 1</span>
        <span id="session1-tooltip" class="tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session1/introduction.html')" class="nav-link p-0" name="session1-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session1/lessons/introIDE.html')" class="nav-link p-0" name="introIDE" title="Laptop Setup">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Laptop Setup</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session1/lessons/introGit.html')" class="nav-link p-0" name="introGit" title="Intro to Git">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Intro to Git</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session1/lessons/hostingGithub.html')" class="nav-link p-0" name="hostingGithub" title="Hosting on GitHub">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Hosting on GitHub</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session1/lessons/gitTerminal.html')" class="nav-link p-0" name="gitTerminal" title="Git & the Terminal">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Git & the Terminal</span></a>
        </li>
      </ul>
    </li>
    <li class="nav-item pb-2">
      <button href="#submenu2" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session2" title="Session 2">
        <i class="fs-4 bi-window-sidebar"></i>
        <span class="ms-3 d-none d-sm-inline">Session 2</span>
        <span id="session2-tooltip" class="tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu2" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session2/introduction.html')" class="nav-link p-0" name="session2-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session2/lessons/htmlBasics.html')" class="nav-link p-0" name="htmlBasics" title="HTML Basics">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">HTML Basics</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session2/lessons/firstWebpage.html')" class="nav-link p-0" name="firstWebpage" title="First Webpage">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">First Webpage</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session2/lessons/chromeDevTools.html')" class="nav-link p-0" name="chromeDevTools" title="Using Dev Tools">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Using Dev Tools</span></a>
        </li>
      </ul>
    </li>
    <li class="nav-item pb-2">
      <button href="#submenu3" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session3" title="Session 3">
        <i class="fs-4 bi-code-square"></i>
        <span class="ms-3 d-none d-sm-inline">Session 3</span>
        <span id="session3-tooltip" class="tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu3" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session3/introduction.html')" class="nav-link p-0" name="session3-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_images.html')" class="nav-link p-0" name="html_images" title="Images">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Images</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_tables.html')" class="nav-link p-0" name="html_tables" title="Tables">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Tables</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_forms.html')" class="nav-link p-0" name="html_forms" title="Forms and Validation">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Forms and Validation</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session3/lessons/html_hyperlinks.html')" class="nav-link p-0" name="html_hyperlinks" title="Hyperlinks and Multi-page sites">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Hyperlinks and Multi-page sites</span></a>
        </li>
      </ul>
    </li>
    <li class="nav-item pb-2">
      <button href="#submenu4" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session4" title="Session 4">
        <i class="fs-4 bi-border-style"></i>
        <span class="ms-3 d-none d-sm-inline">Session 4</span>
        <span id="session4-tooltip" class="tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu4" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session4/introduction.html')" class="nav-link p-0" name="session4-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session4/lessons/introToCSS.html')" class="nav-link p-0" name="introToCSS" title="Intro to CSS">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Intro to CSS</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session4/lessons/layoutsInCSS.html')" class="nav-link p-0" name="layoutsInCSS" title="Layouts in CSS">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Layouts in CSS</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session4/lessons/advancedCSS.html')" class="nav-link p-0" name="advancedCSS" title="Advanced CSS">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Advanced CSS</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session4/lessons/cssActivities.html')" class="nav-link p-0" name="cssActivities" title="CSS Activity">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">CSS Activity</span></a>
        </li>
      </ul>
    </li>
    <li class="nav-item pb-2">
      <button href="#submenu5" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session5" title="Session 5">
        <i class="fs-4 bi-tools"></i>
        <span class="ms-3 d-none d-sm-inline">Session 5</span>
        <span id="session5-tooltip" class="tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu5" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session5/introduction.html')" class="nav-link p-0" name="session5-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibility.html')" class="nav-link p-0" name="accessibility" title="Intro to Accessibility">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Intro to Accessibility</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibilityTools.html')" class="nav-link p-0" name="accessibilityTools" title="Accessibility Tools">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Accessibility Tools</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session5/lessons/accessibilityExample.html')" class="nav-link p-0" name="accessibilityExample" title="Real-World Example">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Real-World Example</span></a>
        </li>
      </ul>
    </li>
    <li class="nav-item pb-2">
      <button href="#submenu6" data-bs-toggle="collapse" class="nav-link px-0 py-0 align-middle" name="session6" title="Showcase">
        <i class="fs-4 bi-easel"></i>
        <span class="ms-3 d-none d-sm-inline">Showcase</span>
        <span id="session6-tooltip" class="box tooltip-text hidden" title="Session Opens Soon">Session Opens Soon</span>
      </button>
      <ul class="collapse nav flex-column ms-1" id="submenu6" data-bs-parent="#menu">
        <li class="w-100">
          <a href="#" onclick="createPath('pages/sessions/session6/introduction.html')" class="nav-link p-0" name="session6-overview" title="Overview">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Overview</span></a>
        </li>
        <li>
          <a href="#" onclick="createPath('pages/sessions/session6/lessons/projectPlanning.html')" class="nav-link p-0" name="projectPlanning" title="Project Planning">
            <i class="fs-4 bi-dash"></i>
            <span class="d-none d-sm-inline">Project Planning</span></a>
        </li>
        <li>
        <a href="#" onclick="createPath('pages/sessions/session6/lessons/additionalHelp.html')" class="nav-link p-0" name="additionalHelp" title="Additional Help">
          <i class="fs-4 bi-dash"></i>
          <span class="d-none d-sm-inline">Additional Help</span></a>
      </li>
      </ul>
    </li>
  </ul>
</div>
</div>
`;

document.querySelector('.page-content').prepend(template.content);
