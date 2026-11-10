// Builds the 6 choices for the Recognition game.
// 1 correct · 2 similar (meaning and/or spelling) · 1 different form of the word · 2 random, same category.
import { BANK, type BankWord } from './data'
import { normRoman } from './check'
import { TABS } from './data'
import type { Direction } from './check'

const enKeys = (en: string) => en.toLowerCase().split(/[,;/]/).map(x => x.replace(/[()]/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean)
const roKey = (w: BankWord) => normRoman(w.ro.split(';')[0])

function lev(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}
/** 0..1, higher = more alike */
const sim = (a: string, b: string) => (a && b ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0)

/** Would this word also be a right answer (same Hindi or a shared English meaning)? */
function clashes(a: BankWord, b: BankWord): boolean {
  if (a.id === b.id || roKey(a) === roKey(b)) return true
  if (a.cat !== b.cat) return false          // "clean" (adjective) vs "to clean" (verb) read differently
  const ea = new Set(enKeys(a.en))
  return enKeys(b.en).some(e => ea.has(e))
}

// theme (Study section) of every word, used for "similar in meaning"
const THEME = new Map<string, string>()
for (const t of TABS) for (const s of t.sections) for (const w of s.items) if (!THEME.has(w.id)) THEME.set(w.id, `${t.key}/${s.name}`)

/** English stem, so close/closed, live/life, clean/cleaner line up. */
const stem = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
  .replace(/(ing|ed|er|est|ly|ness|ful|s)$/, '').replace(/e$/, '').replace(/y$/, 'i').replace(/v$/, 'f')
/** Hindi root: drop the verb ending / helper so kholna ~ khula, band karna ~ band. */
const hiRoot = (w: BankWord) => normRoman(w.ro.split(';')[0].replace(/\b(karna|hona|dena|lena|maarna|lagaana)\b/g, '').replace(/(na|a|i|e)$/, ''))

const tokens = (w: BankWord) => w.ro.split(';')[0].toLowerCase().split(/\s+/).map(t => normRoman(t)).filter(Boolean)

function formScore(w: BankWord, c: BankWord): number {
  // English: close / closed, live / life, clean / clean
  const sw = enKeys(w.en).map(stem), sc = enKeys(c.en).map(stem)
  for (const a of sw) for (const b of sc) {
    if (a.length < 3 || b.length < 3) continue
    if (a === b) return 1
    if (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.95
  }
  // Hindi: band karna / band, sach bolna / sach, pyaar karna / pyaar
  const tw = tokens(w), tc = tokens(c)
  const generic = new Set(['karna', 'hona', 'dena', 'lena', 'ka', 'ki', 'ke', 'se', 'mein', 'par', 'hua'].map(x => normRoman(x)))
  const shared = tw.filter(t => !generic.has(t) && t.length >= 3 && tc.includes(t))
  if (shared.length) return 0.9
  // Hindi verb ↔ adjective: kholna / khula, thakna / thaka
  return 0
}

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const pickTop = (list: { w: BankWord; s: number }[], n: number, spread = 6) =>
  shuffle(list.sort((a, b) => b.s - a.s).slice(0, Math.max(n, spread))).slice(0, n).map(x => x.w)

export type Choice = { w: BankWord; kind: 'correct' | 'partner' | 'similar' | 'form' | 'random' }

/**
 * `pool`: limit the wrong options to these words (e.g. a flashcard deck or the most common words).
 * `partner`: the word paired with this one (opposite flashcard column) — it takes the "different form" spot.
 */
export function buildChoices(w: BankWord, dir: Direction, opts: { pool?: BankWord[]; partner?: BankWord } = {}, n = 6): Choice[] {
  const chosen: Choice[] = [{ w, kind: 'correct' }]
  const ok = (c: BankWord) => chosen.every(x => !clashes(x.w, c))
  const source = opts.pool ?? BANK
  const sameCat = source.filter(c => c.cat === w.cat && ok(c))
  const target = (c: BankWord) => (dir === 'en-hi' ? hiRoot(c) || roKey(c) : enKeys(c.en)[0] ?? '')
  const tw = target(w), theme = THEME.get(w.id)
  const similarTo = (list: BankWord[]) => list.filter(ok).map(c => ({ w: c, s: sim(tw, target(c)) + (w.cat !== 'verbs' && THEME.get(c.id) === theme ? 0.35 : 0) }))

  if (opts.partner && ok(opts.partner)) {
    // 1 correct · 1 partner · 2 similar · 2 random
    chosen.push({ w: opts.partner, kind: 'partner' })
    for (const c of pickTop(similarTo(sameCat), 2, 5)) if (ok(c)) chosen.push({ w: c, kind: 'similar' })
    for (const c of shuffle(sameCat)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
    for (const c of shuffle(source)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
    for (const c of shuffle(BANK)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
    return shuffle(chosen)
  }

  // 1 different form: a related word from another category (close → closed, truth → speak the truth)
  const forms = source.filter(c => c.cat !== w.cat && ok(c)).map(c => ({ w: c, s: formScore(w, c) })).filter(x => x.s >= 0.8)
  const form = pickTop(forms, 1, 2)[0]
  if (form) chosen.push({ w: form, kind: 'form' })

  // 2 similar: spelling of the answer language and/or same theme
  const similar = similarTo(sameCat)
  // when the word has no other form in the bank, a third similar word takes its place
  for (const c of pickTop(similar, form ? 2 : 3, 6)) if (ok(c)) chosen.push({ w: c, kind: 'similar' })

  // the rest: random words from the same category (any category if it runs short)
  for (const c of shuffle(sameCat)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
  for (const c of shuffle(source)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
  for (const c of shuffle(BANK)) { if (chosen.length >= n) break; if (ok(c)) chosen.push({ w: c, kind: 'random' }) }
  return shuffle(chosen)
}
