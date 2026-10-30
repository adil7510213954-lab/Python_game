// App: navigation, dashboard, and wiring the stages together.
const App = (() => {
  const STAGES = [
    { id: "home", icon: "🏠", label: "Dashboard" }, { id: "learn", icon: "📖", label: "Learn" },
    { id: "explore", icon: "🧪", label: "Explore" }, { id: "practice", icon: "🏋️", label: "Practice" },
    { id: "build", icon: "🛠️", label: "Build" }, { id: "code", icon: "💻", label: "Code" },
    { id: "complete", icon: "🏆", label: "Complete" },
  ];
  let topicId, stage = "home";
  const $ = (s) => document.querySelector(s);
  const topic = () => LESSONS[topicId];
  const exIds = () => topic().exercises.map((e) => e.id);
  const freeKey = () => topic().id + ":free";

  const stageDone = (id) => id === "practice" ? exIds().every(Progress.isDone)
    : id === "build" ? Progress.isDone(topic().project.id)
    : id === "complete" ? Progress.isDone(topic().quiz.id) : false;

  const earned = (kind) => kind === "exercises" ? stageDone("practice") : kind === "project" ? stageDone("build") : stageDone("complete");

  // Called after anything is completed: unlock badges, refresh the header and menu.
  function afterProgress() {
    const fresh = topic().badges.filter((b) => earned(b.earnedBy) && Progress.addBadge(b.id));
    updateHud(); renderNav();
    return fresh.map((b) => `🏅 Badge unlocked: ${b.icon} ${b.name}!`).join(" ");
  }

  function updateHud() { $("#xpPill").textContent = Progress.xp() + " XP"; $("#levelPill").textContent = "Level " + Progress.level(); }

  function renderNav() {
    $("#nav").innerHTML = STAGES.map((s) => `<button data-s="${s.id}" class="${s.id === stage ? "active" : ""}">${s.icon} ${s.label}${stageDone(s.id) ? '<span class="tick">✓</span>' : ""}</button>`).join("");
    $("#nav").querySelectorAll("button").forEach((b) => (b.onclick = () => go(b.dataset.s)));
  }

  function go(s) { stage = s; render(); window.scrollTo(0, 0); }
  function openInEditor(code) { Progress.setCode(freeKey(), code); go("code"); }

  const views = {
    home(box) {
      const t = topic(), total = t.exercises.length + 2;
      const n = exIds().filter(Progress.isDone).length + (stageDone("build") ? 1 : 0) + (stageDone("complete") ? 1 : 0);
      box.innerHTML = `<h2>Welcome to Python Lab 👋</h2>
        <section class="card hero"><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p>
          <p class="muted">About ${t.minutes} minutes, ${esc(t.level)} level</p>
          <div class="bar"><i style="width:${Math.round((n / total) * 100)}%"></i></div>
          <p class="muted">${n} of ${total} challenges complete</p>
          <button class="btn" data-a="go">${n ? "Continue" : "Start learning"}</button></section>
        <section class="card"><h3>🎯 You will learn to</h3><ul>${t.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></section>
        <section class="card"><h3>🏅 Badges</h3><div class="badges">${t.badges.map((b) => `<div class="badge ${Progress.hasBadge(b.id) ? "" : "locked"}"><b>${b.icon} ${esc(b.name)}</b><span class="muted">${esc(b.desc)}</span></div>`).join("")}</div></section>
        <section class="card"><p class="muted">💾 Your progress is saved in <b>this browser on this device only</b>. It does not sync to other devices, and clearing your browser data erases it.</p>
          <button class="btn ghost small" data-a="reset">Reset my progress</button></section>`;
      box.querySelector('[data-a="go"]').onclick = () => go(!n ? "learn" : !stageDone("practice") ? "practice" : !stageDone("build") ? "build" : "complete");
      box.querySelector('[data-a="reset"]').onclick = () => { if (confirm("Erase all XP, badges and saved code on this device?")) { Progress.reset(); Progress.setTopic(topicId); init2(); } };
    },
    learn: (box) => LessonEngine.renderLearn(box, topic(), openInEditor),
    explore: (box) => LessonEngine.renderExplore(box, topic()),
    practice(box) {
      const t = topic(); let idx = Math.max(0, t.exercises.findIndex((e) => !Progress.isDone(e.id)));
      box.innerHTML = `<h2>🏋️ Practice</h2><p class="muted">Three exercises: easy, medium, hard. Press <b>Run tests</b> to check your work. Press Ctrl+Enter to run.</p><div class="tabs"></div><div></div>`;
      const tabs = box.querySelector(".tabs"), body = box.lastElementChild;
      const drawTabs = () => {
        tabs.innerHTML = t.exercises.map((e, i) => `<button class="tab ${i === idx ? "active" : ""}">${Progress.isDone(e.id) ? "✅ " : ""}${e.difficulty}</button>`).join("");
        tabs.querySelectorAll("button").forEach((b, i) => (b.onclick = () => { idx = i; drawTabs(); show(); }));
      };
      const show = () => { const e = t.exercises[idx];
        Challenge.mount(body, { ...e, key: e.id, prompt: `<h3>${esc(e.title)}  <span class="muted">+${e.xp} XP</span></h3>` + e.prompt, onPass: () => { const m = afterProgress(); drawTabs(); return m; } }); };
      drawTabs(); show();
    },
    build(box) {
      const p = topic().project;
      box.innerHTML = `<h2>🛠️ Build</h2><p class="muted">Mini-project, worth +${p.xp} XP. Use the Run button to play your game, and Run tests to check it.</p><div></div>`;
      Challenge.mount(box.lastElementChild, { ...p, key: p.id, onPass: afterProgress });
    },
    code(box) {
      box.innerHTML = `<h2>💻 Code</h2><p class="muted">Free editor: write anything you like. Your code is saved on this device. Press Ctrl+Enter to run.</p><div></div>`;
      Challenge.mount(box.lastElementChild, { key: freeKey(), starter: topic().freeStarter });
    },
    complete(box) {
      const t = topic(), quiz = t.quiz;
      box.innerHTML = `<h2>🏆 Complete</h2>
        <section class="card"><h3>Skills practised</h3><p>${t.skills.map((s) => `<span class="pill">${esc(s)}</span>`).join(" ")}</p>
          <div class="badges">${t.badges.map((b) => `<div class="badge ${Progress.hasBadge(b.id) ? "" : "locked"}"><b>${b.icon} ${esc(b.name)}</b><span class="muted">${esc(b.desc)}</span></div>`).join("")}</div></section>
        <section class="card"><h3>Final quiz <span class="muted">+${quiz.xp} XP, pass with ${quiz.passScore} of ${quiz.questions.length}</span></h3><div data-r="quiz"></div></section>
        <section class="card"><h3>What next?</h3><ul>${t.nextSteps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <p><b>${esc(t.bonus.title)}</b><br>${esc(t.bonus.prompt)}</p><button class="btn small" data-a="bonus">Open the bonus in the Code editor</button>
          <p class="muted">Only this topic is installed so far. Ask your facilitator to add the next one.</p></section>`;
      LessonEngine.renderQuiz(box.querySelector('[data-r="quiz"]'), quiz, () => {
        const fresh = Progress.complete(quiz.id, quiz.xp);
        return (fresh ? `+${quiz.xp} XP! ` : "XP already earned. ") + afterProgress();
      });
      box.querySelector('[data-a="bonus"]').onclick = () => openInEditor(t.bonus.starter);
    },
  };

  function render() {
    renderNav();
    const main = $("#main"); main.innerHTML = "";
    const box = document.createElement("div"); main.appendChild(box);
    views[stage](box);
  }

  function init2() { afterProgress(); stage = "home"; render(); }

  function init() {
    const ids = Object.keys(LESSONS);
    topicId = ids.includes(Progress.getTopic()) ? Progress.getTopic() : ids[0];
    const sel = $("#topicSelect");
    if (ids.length > 1) {
      sel.hidden = false;
      sel.innerHTML = ids.map((id) => `<option value="${id}" ${id === topicId ? "selected" : ""}>${esc(LESSONS[id].title)}</option>`).join("");
      sel.onchange = () => { topicId = sel.value; Progress.setTopic(topicId); init2(); };
    }
    PythonRunner.onState = (state) => {
      const pill = $("#engineStatus"), banner = $("#loadBanner");
      pill.className = "pill " + (state === "ready" ? "ok" : state === "error" ? "bad" : "");
      pill.textContent = state === "ready" ? "✅ Python ready" : state === "error" ? "❌ Python failed to load" : "⏳ Loading Python…";
      banner.hidden = state !== "loading";
    };
    PythonRunner.start();
    init2();
  }

  return { init };
})();
App.init();
