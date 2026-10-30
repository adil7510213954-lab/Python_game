// PythonRunner: the page's connection to the Python worker.
//   PythonRunner.run({code, inputs, seed, setup, timeoutMs}) -> Promise of a result object
// The result has status "done" | "error" | "need_input" | "timeout", plus output and error text.
const PythonRunner = (() => {
  let worker, readyPromise, pending = null, timer = null, chain = Promise.resolve();
  const api = { onState: () => {} }; // the app sets this to show "loading / ready / error"

  function start() {
    api.onState("loading");
    const w = (worker = new Worker("js/worker.js"));
    readyPromise = new Promise((resolve, reject) => {
      w.onmessage = (e) => {
        const d = e.data;
        if (d.type === "ready") { api.onState("ready"); resolve(); }
        else if (d.type === "initError") { api.onState("error"); reject(new Error(d.message)); }
        else if (d.type === "result" && pending) {
          clearTimeout(timer);
          const done = pending; pending = null; done(d.result);
        }
      };
      w.onerror = () => { api.onState("error"); reject(new Error("worker failed")); };
    });
    readyPromise.catch(() => {}); // avoid "unhandled rejection" noise; run() reports problems
  }

  async function exec({ code, inputs = [], seed = 1, setup = "", timeoutMs = 5000 }) {
    try { await readyPromise; }
    catch (e) {
      return { status: "error", output: "", usesLoop: false,
        error: "The Python engine could not start. Check your internet connection and reload the page." };
    }
    return new Promise((resolve) => {
      pending = resolve;
      timer = setTimeout(() => {
        // Infinite loop (or just very slow): kill the worker and start a fresh one.
        worker.terminate(); pending = null; start();
        resolve({ status: "timeout", output: "", usesLoop: false,
          error: `⏱️ Stopped: the program ran for more than ${timeoutMs / 1000} seconds. Is there a loop that never ends? Make sure its condition can become False, or that a break can run.` });
      }, timeoutMs);
      worker.postMessage({ code, inputs, seed, setup });
    });
  }

  // Runs are queued one after another so they never overlap.
  api.run = (opts) => { const p = chain.then(() => exec(opts)); chain = p.catch(() => {}); return p; };
  api.ready = () => readyPromise;
  api.start = start;
  return api;
})();
