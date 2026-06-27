document.addEventListener("DOMContentLoaded", async () => {

	const navTarget = document.getElementById("session-navigation");
	const bannerTarget = document.getElementById("session-banner");

	if (!navTarget) {
		console.error("session-navigation target not found!");
		return;
	}

	await waitForAuth();

	const sessionFlow = [
		{ path: "sessions/session1/introduction.html", type: "intro", session: 1 },
		{ path: "sessions/session1/lessons/introIDE.html", type: "lesson" },
		{ path: "sessions/session1/lessons/introGit.html", type: "lesson" },
		{ path: "sessions/session1/lessons/firstRepo.html", type: "lesson" },
		{ path: "sessions/session1/lessons/hostingGithub.html", type: "lesson" },
		{ path: "sessions/session1/lessons/gitVScode.html", type: "lesson" },
		{ path: "sessions/session1/lessons/gitTerminal.html", type: "lesson", optional: true, },
		{ path: "sessions/session1/lessons/githubDesktop.html", type: "lesson", optional: true, },
		{ path: "sessions/session1/lessons/gitBranchConflicts.html", type: "lesson", optional: true, },
		{ path: "sessions/session2/introduction.html", type: "intro", session: 2 },
		{ path: "sessions/session2/lessons/htmlBasics.html", type: "lesson" },
		{ path: "sessions/session2/lessons/firstWebpage.html", type: "lesson" },
		{ path: "sessions/session2/lessons/chromeDevTools.html", type: "lesson" },
		{ path: "sessions/session3/introduction.html", type: "intro", session: 3 },
		{ path: "sessions/session3/lessons/html_images.html", type: "lesson" },
		{ path: "sessions/session3/lessons/html_tables.html", type: "lesson" },
		{ path: "sessions/session3/lessons/html_forms.html", type: "lesson" },
		{ path: "sessions/session3/lessons/html_hyperlinks.html", type: "lesson" },
		{ path: "sessions/session4/introduction.html", type: "intro", session: 4 },
		{ path: "sessions/session4/lessons/introToCSS.html", type: "lesson" },
		{ path: "sessions/session4/lessons/layoutsInCSS.html", type: "lesson" },
		{ path: "sessions/session4/lessons/advancedCSS.html", type: "lesson" },
		{ path: "sessions/session4/lessons/cssActivities.html", type: "lesson" },
		{ path: "sessions/session5/introduction.html", type: "intro", session: 5 },
		{ path: "sessions/session5/lessons/accessibility.html", type: "lesson" },
		{ path: "sessions/session5/lessons/accessibilityTools.html", type: "lesson" },
		{ path: "sessions/session5/lessons/accessibilityExample.html", type: "lesson", optional: true, },
		{ path: "sessions/session6/introduction.html", type: "intro", session: 6 },
		{ path: "sessions/session6/lessons/projectPlanning.html", type: "lesson" },
		{ path: "sessions/session6/lessons/additionalHelp.html", type: "lesson", optional: true, },
		{ path: "sessions/session7/introduction.html", type: "intro", session: 7 },
		{ path: "sessions/session7/lessons/goodUses.html", type: "lesson" },
		{ path: "sessions/session7/lessons/humanFirst.html", type: "lesson" },
		{ path: "sessions/session7/lessons/promptPractice.html", type: "lesson" },
		{ path: "sessions/session7/lessons/modelsTokensCosts.html", type: "lesson" },
		{ path: "sessions/session7/lessons/reviewAndRepeat.html", type: "lesson" },
		{ path: "sessions/session7/lessons/furtherLearning.html", type: "lesson", optional: true, },
	];

	const currentPath = window.location.pathname.replace(/^.*pages\//, "");
	console.log("Current page:", currentPath);

	const currentIndex = sessionFlow.findIndex(
		(item) => item.path === currentPath
	);
	if (currentIndex === -1) {
		console.error("Current page not found in sessionFlow.");
		return;
	}

	const currentItem = sessionFlow[currentIndex];

	// === INTRO PAGE ===
	if (currentItem.type === "intro") {
		navTarget.innerHTML = `
      <div class="session-nav-container">
        <div class="session-nav-layout">
          <div class="session-nav-section right">
            <button id="startSessionBtn" class="btn btn-primary session-nav-button">
              Start session ${currentItem.session} →
            </button>
          </div>
        </div>
      </div>
    `;
		const nextLesson = sessionFlow[currentIndex + 1];
		const startBtn = document.getElementById("startSessionBtn");

		const overviewName = extractLessonName(currentPath);

		if (await checkLessonComplete(overviewName)) {
			startBtn.style.backgroundColor = "#011460";
			startBtn.style.borderColor = "#011460";
		}

		if (nextLesson) {
			startBtn.addEventListener("click", async (e) => {
				e.preventDefault();
				await saveLesson(overviewName);
				startBtn.style.backgroundColor = "#011460";
				startBtn.style.borderColor = "#011460";
				setTimeout(() => {
					window.location.href = "../../" + nextLesson.path;
				}, 200);
			});
		}
		return;
	}

	// === LESSON PAGE ===
	navTarget.innerHTML = `
    <div class="session-nav-container">
      <div class="session-nav-layout">
        <div class="session-nav-section left">
          <button id="prevSessionBtn" class="btn btn-outline-primary session-nav-button">← Previous</button>
        </div>
        <div class="session-nav-section center">
          <button id="markCompleteBtn" class="btn btn-success session-nav-button">✓ Mark complete</button>
        </div>
        <div class="session-nav-section right">
          <button id="nextSessionBtn" class="btn btn-outline-primary session-nav-button">Next →</button>
        </div>
      </div>
    </div>
  `;

	const prevBtn = document.getElementById("prevSessionBtn");
	const nextBtn = document.getElementById("nextSessionBtn");
	const markBtn = document.getElementById("markCompleteBtn");

	if (currentIndex > 0) {
		prevBtn.addEventListener("click", () => {
			navigateTo(sessionFlow[currentIndex - 1].path);
		});
	} else {
		prevBtn.style.visibility = "hidden";
	}

	if (currentIndex < sessionFlow.length - 1) {
		nextBtn.addEventListener("click", () => {
			navigateTo(sessionFlow[currentIndex + 1].path);
		});
	} else {
		nextBtn.style.visibility = "hidden";
	}

	const lessonName = extractLessonName(currentPath);

	function extractLessonName(path) {
		const parts = path.split("/");
		const filename = parts.pop().replace(".html", "");
		const session = parts.findLast((p) => /^session\d+$/.test(p));

		if (filename === "introduction" && session) {
			return `${session}-overview`;
		}

		return filename;
	}

	// render saved state from DynamoDB
	await renderCompletionStatus(lessonName, markBtn, bannerTarget);

	// save & update on click
	markBtn.addEventListener("click", async () => {
		await saveLesson(lessonName);
		await renderCompletionStatus(lessonName, markBtn, bannerTarget);
	});
});

// ================= Helper Functions =================
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

function navigateTo(targetPath) {
	window.location.href = getPath() + "pages/" + targetPath;
}

// === Extract correct session name from pathname ===
function getCurrentSessionName() {
	return window.location.pathname.split("/").find((part) => /^session\d+$/.test(part));
}

// === Lesson completion helpers using DynamoDB ===
async function saveLesson(lessonName) {
	const session = getCurrentSessionName();
	if (!session || typeof window._saveLessonComplete !== 'function') return;

	await window._saveLessonComplete(session, lessonName);
}

async function checkLessonComplete(lessonName) {
	const session = getCurrentSessionName();
	if (!session || typeof window._isLessonComplete !== 'function') return false;

	return await window._isLessonComplete(session, lessonName);
}

function extractLessonName(path) {
	const parts = path.split("/");
	const filename = parts.pop().replace(".html", "");
	const session = parts.findLast(p => /^session\d+$/.test(p));

	if (filename === "introduction" && session) {
		return `${session}-overview`;
	}

	return filename;
}


async function renderCompletionStatus(lessonName, markBtn, bannerTarget) {
	const completed = await checkLessonComplete(lessonName);

	if (completed) {
		if (markBtn) {
			markBtn.classList.remove("btn-success");
			markBtn.classList.add("btn-secondary");
			markBtn.innerText = "✓ Completed";
		}
		if (bannerTarget) {
			bannerTarget.innerHTML = `
        <div class="completed-banner">
          <i class="bi bi-check-circle-fill completed-icon"></i>
          <span class="completed-label">You have completed this section!</span>
        </div>
      `;
		}
	} else {
		if (markBtn) {
			markBtn.style.display = "inline-block";
			markBtn.classList.remove("btn-secondary");
			markBtn.classList.add("btn-success");
			markBtn.innerText = "✓ Mark complete";
		}
		if (bannerTarget) bannerTarget.innerHTML = "";
	}
}
