document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ sessionNavigation.js loaded");

  const navTarget = document.getElementById("session-navigation");
  const bannerTarget = document.getElementById("session-banner");

  if (!navTarget) {
    console.error("❌ session-navigation target not found!");
    return;
  }

  await waitForFbAuth();

  const sessionFlow = [
    { path: "sessions/session1/introduction.html", type: "intro", session: 1 },
    { path: "sessions/session1/lessons/introIDE.html", type: "lesson" },
    { path: "sessions/session1/lessons/introGit.html", type: "lesson" },
    { path: "sessions/session1/lessons/firstRepo.html", type: "lesson" },
    { path: "sessions/session1/lessons/hostingGithub.html", type: "lesson" },
    { path: "sessions/session1/lessons/gitVScode.html", type: "lesson" },
    { path: "sessions/session1/lessons/gitTerminal.html", type: "lesson", optional: true },
    { path: "sessions/session1/lessons/githubDesktop.html", type: "lesson", optional: true },
  ];

  const currentPath = window.location.pathname.replace(/^.*pages\//, "");
  console.log("Current page:", currentPath);

  const currentIndex = sessionFlow.findIndex((item) => item.path === currentPath);
  if (currentIndex === -1) {
    console.error("❌ Current page not found in sessionFlow.");
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

    if (await isLessonComplete("session1-overview")) {
      startBtn.style.backgroundColor = "#011460";
      startBtn.style.borderColor = "#011460";
    }

    if (nextLesson) {
      startBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await saveLessonComplete("session1-overview");
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

  // ✅ Render saved state from Firebase
  await renderCompletionStatus(lessonName, markBtn, bannerTarget);

  // ✅ Save and update on click
  markBtn.addEventListener("click", async () => {
    await saveLessonComplete(lessonName);
    await renderCompletionStatus(lessonName, markBtn, bannerTarget);
  });
});

// ================= Helper Functions =================

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

function navigateTo(targetPath) {
  window.location.href = getPath() + "pages/" + targetPath;
}

function extractLessonName(path) {
  const parts = path.split("/");
  const filename = parts.pop();
  return filename.replace(".html", "");
}

async function saveLessonComplete(lessonName) {
  const user = window.fbAuth.currentUser;
  if (!user) return;

  const session = window.location.pathname.split("/")[4];
  const ref = window.fbDB.ref(`users/${user.uid}/completedSessions/${session}`);
  await ref.update({ [lessonName]: true });
}

async function isLessonComplete(lessonName) {
  const user = window.fbAuth.currentUser;
  if (!user) return false;

  const session = window.location.pathname.split("/")[4];
  const ref = window.fbDB.ref(`users/${user.uid}/completedSessions/${session}`);
  const snapshot = await ref.once("value");
  const data = snapshot.val() || {};

  return !!data[lessonName];
}

async function renderCompletionStatus(lessonName, markBtn, bannerTarget) {
  const completed = await isLessonComplete(lessonName);

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
