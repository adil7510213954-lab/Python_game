// LessonEngine: draws the Learn cards, the Explore demo and the final quiz from lesson data.

// Escapes text so it is safe to put inside HTML (shared by the other scripts).
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

const LessonEngine = (() => {
  // Runs a code snippet and prints the result into a small output box.
  async function runInline(code, box) {
    box.hidden = false;
    box.textContent = "Running…";
    const r = await PythonRunner.run({ code, timeoutMs: 3000 });
    box.textContent = r.output || (r.status === "done" ? "(no output)" : "");
    if (r.status !== "done") {
      const e = document.createElement("span");
      e.className = "err-text";
      e.textContent = (r.output ? "\n" : "") + (r.error || "This example needs typed input. Open it in the Code editor.");
      box.appendChild(e);
    }
  }

  function renderLearn(el, t, openInEditor) {
    el.innerHTML = `<h2>📖 Learn: ${esc(t.title)}</h2><p class="muted">Press <b>Run</b> on each example, then change the code in the editor and see what happens.</p>`;
    t.learn.forEach((l, i) => {
      const card = document.createElement("section");
      card.className = "card";
      card.innerHTML = `<h3>${i + 1}. ${esc(l.title)}</h3>${l.body}
        <pre class="code">${esc(l.code)}</pre>
        <div class="row"><button class="btn small" data-a="run">▶ Run this</button>
        <button class="btn small ghost" data-a="edit">Open in Code editor</button></div>
        <pre class="terminal mini" hidden></pre>
        <p><b>What it does:</b> ${esc(l.explain)}</p>`;
      card.querySelector('[data-a="run"]').onclick = () => runInline(l.code, card.querySelector(".terminal"));
      card.querySelector('[data-a="edit"]').onclick = () => openInEditor(l.code);
      el.appendChild(card);
    });
  }

  // ---- Explore: an interactive loop visualiser (for + while) ----
  const DEMOS = {
    loopVisualizer(el) {
      let mode = "for", shown = 0, steps = [], code = "";
      el.innerHTML = `<div class="tabs"><button class="tab active" data-m="for">for + range()</button><button class="tab" data-m="while">while</button></div>
        <div class="controls" data-r="ctl"></div>
        <pre class="code" data-r="code"></pre>
        <div class="viz" data-r="viz"></div>
        <div class="row"><button class="btn" data-a="next">Next step ▶</button><button class="btn ghost" data-a="reset">Start over</button><button class="btn ghost" data-a="run">Run in real Python</button></div>
        <p class="muted" data-r="msg"></p><pre class="terminal mini" data-r="out" hidden></pre>`;
      const $ = (r) => el.querySelector(`[data-r="${r}"]`);
      const val = (id) => parseInt(el.querySelector("#" + id).value, 10);

      function controls() {
        const f = (id, label, v) => `<label>${label} <input id="${id}" type="number" value="${v}"></label>`;
        $("ctl").innerHTML = mode === "for"
          ? f("a", "start", 1) + f("b", "stop", 6) + f("c", "step", 1)
          : f("a", "count starts at", 1) + f("b", "keep going while count &lt;", 5) + f("c", "add each turn", 1);
        $("ctl").querySelectorAll("input").forEach((i) => (i.oninput = build));
      }

      function build() {
        const a = val("a"), b = val("b"), c = val("c");
        steps = []; shown = 0; $("out").hidden = true;
        if ([a, b, c].some(Number.isNaN)) { $("msg").textContent = "Type whole numbers in the boxes."; $("viz").innerHTML = ""; return; }
        if (mode === "for") {
          code = `for i in range(${a}, ${b}${c === 1 ? "" : ", " + c}):\n    print(i)`;
          if (c === 0) { $("msg").textContent = "range() cannot use a step of 0."; $("code").textContent = code; $("viz").innerHTML = ""; return; }
          for (let i = a; c > 0 ? i < b : i > b; i += c) {
            steps.push({ t: `i is ${i}`, d: `print(${i}) shows ${i}` });
            if (steps.length >= 30) break;
          }
          steps.push({ t: "No values left in range()", d: "The loop ends. Python moves on.", cls: "stop" });
        } else {
          code = `count = ${a}\nwhile count < ${b}:\n    print(count)\n    count = count + ${c}`;
          let v = a;
          while (steps.length < 12) {
            const ok = v < b;
            steps.push(ok ? { t: `Check: ${v} < ${b} is True`, d: `print(${v}), then count becomes ${v + c}` }
                          : { t: `Check: ${v} < ${b} is False`, d: "The loop ends. Python moves on.", cls: "stop" });
            if (!ok) break;
            v += c;
          }
          if (steps[steps.length - 1].cls !== "stop")
            steps.push({ t: "⚠️ Infinite loop!", d: "count never reaches the limit, so the check is always True.", cls: "bad" });
        }
        $("code").textContent = code;
        draw();
      }

      function draw() {
        $("viz").innerHTML = steps.slice(0, shown).map((s, i) =>
          `<div class="step ${s.cls || ""} ${i === shown - 1 ? "current" : ""}"><b>${esc(s.t)}</b><br><span class="muted">${esc(s.d)}</span></div>`).join("");
        $("msg").textContent = shown === 0 ? "Press “Next step” to walk through the loop one turn at a time."
          : shown >= steps.length ? "Done! Change the numbers above and watch what changes." : `Turn ${shown} of the loop.`;
      }

      el.querySelectorAll(".tab").forEach((b) => (b.onclick = () => {
        mode = b.dataset.m;
        el.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
        controls(); build();
      }));
      el.querySelector('[data-a="next"]').onclick = () => { if (shown < steps.length) { shown++; draw(); } };
      el.querySelector('[data-a="reset"]').onclick = build;
      el.querySelector('[data-a="run"]').onclick = () => runInline(code, $("out"));
      controls(); build();
    },
  };

  function renderExplore(el, t) {
    el.innerHTML = `<h2>🧪 Explore</h2><p class="muted">Change the numbers and step through the loop. Then press “Run in real Python” to compare. In the while demo, try adding 0 to see an infinite loop being stopped safely.</p><div class="card" data-r="demo"></div>`;
    DEMOS[t.demo](el.querySelector('[data-r="demo"]'));
  }

  // ---- Final assessment ----
  function renderQuiz(el, quiz, onPass) {
    el.innerHTML = quiz.questions.map((q, i) => `<fieldset class="q"><legend>${i + 1}. ${q.q}</legend>` +
      q.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join("") +
      `<p class="muted" data-fb="${i}"></p></fieldset>`).join("") +
      `<button class="btn" data-a="check">Check answers</button><p data-r="res"></p>`;
    el.querySelector('[data-a="check"]').onclick = () => {
      let score = 0;
      quiz.questions.forEach((q, i) => {
        const pick = el.querySelector(`input[name="q${i}"]:checked`);
        const fb = el.querySelector(`[data-fb="${i}"]`);
        if (pick && +pick.value === q.answer) { score++; fb.textContent = "✅ " + q.explain; }
        else fb.textContent = pick ? "❌ Not quite. Think again and try another answer." : "Pick an answer.";
      });
      const res = el.querySelector('[data-r="res"]');
      res.innerHTML = score >= quiz.passScore
        ? `🎉 You scored ${score}/${quiz.questions.length}. ${onPass()}`
        : `You scored ${score}/${quiz.questions.length}. You need ${quiz.passScore} to pass. Review the Learn stage and try again.`;
    };
  }

  return { renderLearn, renderExplore, renderQuiz };
})();
