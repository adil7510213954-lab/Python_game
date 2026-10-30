// Challenge: the coding workspace (editor + terminal + hints + tests) used by Practice, Build and Code.
const Challenge = (() => {
  // Runs ONE test against the student's code. Checks real program behaviour (its output).
  async function evaluate(t, code) {
    const res = await PythonRunner.run({ code, inputs: t.inputs || [], seed: 1, setup: t.setup || "", timeoutMs: 3000 });
    const fail = (msg, extra) => ({ name: t.name, pass: false, msg, extra, hint: t.hint, stop: res.status === "timeout" });
    if (res.status === "timeout") return fail("Your program did not finish within 3 seconds. Does your loop ever stop?");
    if (res.status === "error") return fail("Your program crashed.", res.error);
    if (res.status === "need_input") return fail("Your program asked for more input than this test gives it. Does your loop stop at the right moment?", res.output);
    if (t.needsLoop && !res.usesLoop) return fail("This task needs a for or while loop.");
    const lines = res.output.split("\n").map((l) => l.trimEnd());
    const last = [...lines].reverse().find((l) => l.trim() !== "") || "";
    if (t.expectOutput !== undefined && lines.join("\n").trim() !== t.expectOutput)
      return fail("The output is different from what was asked.", `Expected:\n${t.expectOutput}\n\nYours:\n${lines.join("\n").trim() || "(nothing printed)"}`);
    if (t.expectLast !== undefined && last.trim() !== t.expectLast)
      return fail("The last line is different.", `Expected: ${t.expectLast}\nYours:    ${last.trim() || "(nothing printed)"}`);
    for (const c of t.contains || []) if (!res.output.includes(c)) return fail(`Your output should include “${c}” at some point.`);
    for (const c of t.notContains || []) if (res.output.includes(c)) return fail(`Your output should not include “${c}” in this case.`);
    return { name: t.name, pass: true };
  }

  // cfg: { key, id?, xp?, prompt?, starter, hints?, tests?, onPass? }
  function mount(el, cfg) {
    const hints = cfg.hints || [];
    el.innerHTML = `${cfg.prompt ? `<div class="prompt">${cfg.prompt}</div>` : ""}
      <textarea data-r="ta"></textarea>
      <div class="row">
        <button class="btn" data-a="run">▶ Run</button>
        ${cfg.tests ? '<button class="btn" data-a="test">✔ Run tests</button>' : ""}
        <button class="btn ghost" data-a="clear">Clear output</button>
        <button class="btn ghost" data-a="reset">↺ Reset code</button>
      </div>
      <div class="terminal" aria-live="polite"><pre data-r="out"></pre><div class="err" data-r="err"></div>
        <div class="inrow" data-r="inrow" hidden><span>⌨️</span><input data-r="stdin" aria-label="Type your answer and press Enter" placeholder="Type your answer, then press Enter"></div></div>
      <div data-r="results"></div>
      ${hints.length ? `<div class="hints"><button class="btn ghost small" data-a="hint">💡 Show hint 1 of ${hints.length}</button><ol data-r="hintList"></ol></div>` : ""}`;
    const $ = (r) => el.querySelector(`[data-r="${r}"]`);
    const btn = (a) => el.querySelector(`[data-a="${a}"]`);
    const out = $("out"), err = $("err"), inrow = $("inrow"), stdin = $("stdin"), results = $("results");

    const ta = $("ta");
    ta.value = Progress.getCode(cfg.key) ?? cfg.starter;
    const cm = CodeMirror.fromTextArea(ta, {
      mode: "python", theme: "material-darker", lineNumbers: true, indentUnit: 4,
      extraKeys: { Tab: (c) => c.replaceSelection("    "), "Ctrl-Enter": () => start() },
    });
    cm.on("change", () => Progress.setCode(cfg.key, cm.getValue()));

    // ---- Run (interactive: replays the program each time a new answer is typed) ----
    let session = 0, seed = 1, inputs = [];
    const clearOutput = () => { out.textContent = ""; err.textContent = ""; inrow.hidden = true; };

    async function execute() {
      const mine = session;
      const r = await PythonRunner.run({ code: cm.getValue(), inputs, seed, timeoutMs: 5000 });
      if (mine !== session) return; // the student pressed Run again meanwhile
      out.textContent = r.output;
      err.textContent = r.status === "error" || r.status === "timeout" ? r.error : "";
      inrow.hidden = r.status !== "need_input";
      if (r.status === "need_input") stdin.focus();
      else if (r.status === "done" && !r.output) out.textContent = "(program finished, nothing was printed)";
    }
    function start() { session++; inputs = []; seed = Math.floor(Math.random() * 1e6); clearOutput(); out.textContent = "Running…"; execute(); }
    stdin.onkeydown = (e) => { if (e.key === "Enter") { inputs.push(stdin.value); stdin.value = ""; execute(); } };

    btn("run").onclick = start;
    btn("clear").onclick = () => { session++; clearOutput(); results.innerHTML = ""; };
    btn("reset").onclick = () => { if (confirm("Reset your code back to the starter code?")) { cm.setValue(cfg.starter); session++; clearOutput(); } };

    // ---- Hints: one more each time ----
    let shownHints = 0;
    const hintBtn = btn("hint");
    if (hintBtn) hintBtn.onclick = () => {
      const li = document.createElement("li"); li.textContent = hints[shownHints++]; $("hintList").appendChild(li);
      hintBtn.textContent = shownHints < hints.length ? `💡 Show hint ${shownHints + 1} of ${hints.length}` : "All hints shown";
      hintBtn.disabled = shownHints >= hints.length;
    };

    // ---- Tests ----
    if (cfg.tests) btn("test").onclick = async () => {
      session++; clearOutput();
      results.innerHTML = '<p class="muted">Running tests…</p>';
      const code = cm.getValue(), rows = [];
      for (const t of cfg.tests) { const r = await evaluate(t, code); rows.push(r); if (r.stop) break; }
      const passed = rows.filter((r) => r.pass).length;
      results.innerHTML = "";
      rows.forEach((r) => {
        const d = document.createElement("div");
        d.className = "result " + (r.pass ? "pass" : "fail");
        d.innerHTML = `${r.pass ? "✅" : "❌"} <b>${esc(r.name)}</b>` + (r.pass ? "" :
          `<div>${esc(r.msg)}</div>${r.hint ? `<div class="muted">💡 ${esc(r.hint)}</div>` : ""}${r.extra ? `<pre>${esc(r.extra)}</pre>` : ""}`);
        results.appendChild(d);
      });
      const banner = document.createElement("div");
      if (passed === cfg.tests.length) {
        const fresh = Progress.complete(cfg.id, cfg.xp);
        const extra = cfg.onPass ? cfg.onPass() : "";
        banner.className = "success";
        banner.innerHTML = `🎉 <b>All ${passed} tests passed!</b> ${fresh ? `+${cfg.xp} XP.` : "(You already earned the XP for this one.)"} ${extra}`;
      } else {
        banner.className = "failure";
        banner.textContent = `${passed} of ${cfg.tests.length} tests passed. Read the red messages, fix your code, and run the tests again. Stuck? Open a hint.`;
      }
      results.prepend(banner);
    };
  }

  return { mount };
})();
