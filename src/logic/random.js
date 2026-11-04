// Seedable random number generator (mulberry32).
// The same seed always gives the same sequence, so tests can repeat results.
export function createRandom(seed = Date.now()) {
  let state = seed >>> 0;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  // Whole number from min to max (both included).
  function int(min, max) {
    return min + Math.floor(next() * (max - min + 1));
  }
  function pick(list) {
    return list[int(0, list.length - 1)];
  }
  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  return { next, int, pick, shuffle };
}
