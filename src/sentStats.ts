// Per-sentence history kept on this device, used for "Most difficult".
import type { WordStat } from './stats'
const KEY = 'kalee-sentence-stats-v1'
type Stats = Record<string, WordStat>
export function loadSentStats(): Stats { try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Stats } catch { return {} } }
export function recordSent(id: number, correct: boolean) {
  const s = loadSentStats(); const cur = s[id] || { seen: 0, missed: 0 }
  cur.seen += 1; if (!correct) cur.missed += 1; s[id] = cur
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* */ }
}
/** Undo a miss when the player decides their answer was right after all. */
export function forgiveSent(id: number) {
  const s = loadSentStats(); const cur = s[id]; if (!cur || !cur.missed) return
  cur.missed -= 1; s[id] = cur
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* */ }
}
