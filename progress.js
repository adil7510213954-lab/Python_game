// Progress: XP, finished challenges, badges and saved code, kept in localStorage.
// localStorage lives in ONE browser on ONE device: it does not sync between devices.
const Progress = (() => {
  const KEY = "pythonLab.v1";
  const fresh = () => ({ xp: 0, done: {}, badges: [], code: {}, topic: null });
  let s = fresh();
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* use defaults */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked */ } };
  return {
    xp: () => s.xp,
    level: () => Math.floor(s.xp / 100) + 1,
    isDone: (id) => !!s.done[id],
    // Marks a challenge as finished. XP is paid only the first time. Returns true if it was new.
    complete(id, xp) { if (s.done[id]) return false; s.done[id] = true; s.xp += xp || 0; save(); return true; },
    hasBadge: (id) => s.badges.includes(id),
    addBadge(id) { if (s.badges.includes(id)) return false; s.badges.push(id); save(); return true; },
    getCode: (key) => (key in s.code ? s.code[key] : null),
    setCode(key, code) { s.code[key] = code; save(); },
    getTopic: () => s.topic,
    setTopic(id) { s.topic = id; save(); },
    reset() { s = fresh(); save(); },
  };
})();
