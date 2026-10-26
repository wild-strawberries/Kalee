// Per-word history kept on this device, used for "Most difficult".
const KEY = 'kalee-stats-v1'
export interface WordStat { seen: number; missed: number }
type Stats = Record<string, WordStat>

export function loadStats(): Stats {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Stats } catch { return {} }
}
export function record(id: string, correct: boolean) {
  const s = loadStats()
  const cur = s[id] || { seen: 0, missed: 0 }
  cur.seen += 1
  if (!correct) cur.missed += 1
  s[id] = cur
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable */ }
}
/** Higher = harder. Only words missed at least once count as difficult. */
export function difficulty(st?: WordStat): number {
  if (!st || st.missed === 0) return 0
  return st.missed / st.seen + st.missed * 0.1
}
