// Web Worker: loads Pyodide (Python in the browser) and runs student code OFF the main thread.
// If a program never ends, the page can simply terminate this worker, so the site never freezes.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let runProgram;
(async () => {
  try {
    const py = await loadPyodide();
    py.runPython(await (await fetch("harness.py")).text()); // harness.py sits next to this file
    runProgram = py.globals.get("run_program");
    postMessage({ type: "ready" });
  } catch (err) {
    postMessage({ type: "initError", message: String(err) });
  }
})();

onmessage = (e) => {
  const { code, inputs, seed, setup } = e.data;
  const json = runProgram(code, JSON.stringify(inputs), seed, setup);
  postMessage({ type: "result", result: JSON.parse(json) });
};
