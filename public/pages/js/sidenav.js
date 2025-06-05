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
    </ul>
  </div>
</div>
`;

document.querySelector(".page-content").prepend(template.content);

document.addEventListener("DOMContentLoaded", async () => {
	await waitForFbAuth();
	updateSideNavCompletionStatus();
});

async function waitForFbAuth() {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (window.fbAuth && window.fbDB && window.fbAuth.currentUser) {
				clearInterval(interval);
				resolve();
			}
		}, 50);
	});
}

async function updateSideNavCompletionStatus() {
	const user = window.fbAuth.currentUser;
	if (!user) return;

	const sessions = [
		"session1",
		"session2",
		"session3",
		"session4",
		"session5",
		"session6",
	];

	for (const session of sessions) {
		const ref = window.fbDB.ref(
			`users/${user.uid}/completedSessions/${session}`
		);
		const snapshot = await ref.once("value");
		const completed = snapshot.val() || {};

		const completedLessons = Object.keys(completed);

		const allLessons = {
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
			session2: [
				"session2-overview",
				"htmlBasics",
				"firstWebpage",
				"chromeDevTools",
			],
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
		};

		const optionalLessons = {
			session1: ["gitTerminal", "githubDesktop"],
			session5: ["accessibilityExample"],
			session6: ["additionalHelp"],
		};

		const lessonNameToElementName = {
			session1: { "session1-overview": "session1-overview" },
			session2: { "session2-overview": "session2-overview" },
			session3: { "session3-overview": "session3-overview" },
			session4: { "session4-overview": "session4-overview" },
			session5: { "session5-overview": "session5-overview" },
			session6: { "session6-overview": "session6-overview" },
		};

		for (const session of sessions) {
			const ref = window.fbDB.ref(
				`users/${user.uid}/completedSessions/${session}`
			);
			const snapshot = await ref.once("value");
			const completed = snapshot.val() || {};
			const completedLessons = Object.keys(completed);

			const requiredLessons = allLessons[session].filter(
				(name) => !optionalLessons[session]?.includes(name)
			);

			// Restore correct lookup for overview entries
			completedLessons.forEach((lessonName) => {
				const lookupName =
					lessonNameToElementName[session]?.[lessonName] || lessonName;
				const el = document.querySelector(`[name="${lookupName}"]`);
				if (el) {
					const icon = el.querySelector("i");
					const label = el.querySelector("span");
					if (icon) icon.className = "fs-4 bi-check-circle text-success";
					if (label) label.classList.add("text-success");
				}
			});

			// Check if all required lessons completed
			const isSessionComplete = requiredLessons.every((name) =>
				completedLessons.includes(name)
			);

			if (isSessionComplete) {
				const sessionBtn = document.querySelector(`button[name="${session}"]`);
				if (sessionBtn) {
					const icon = sessionBtn.querySelector("i");
					const label = sessionBtn.querySelector("span");
					if (icon) icon.className = "fs-4 bi-check-circle-fill text-success";
					if (label) label.classList.add("text-success");
				}
			}
		}
	}
}
