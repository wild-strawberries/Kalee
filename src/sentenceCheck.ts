// Word-by-word comparison for sentence answers, tolerant of spelling and small differences.
import { isDevanagari, normDeva, normEnglish, normRoman } from './check'
import { devToRoman } from './translit'

const CONTRACTIONS: [RegExp, string][] = [
  [/\b(i)'m\b/g, '$1 am'], [/\b(\w+)'re\b/g, '$1 are'], [/\b(\w+)'ve\b/g, '$1 have'], [/\b(\w+)'ll\b/g, '$1 will'],
  [/\b(\w+)'d\b/g, '$1 would'], [/\bcan't\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\b(\w+)n't\b/g, '$1 not'],
  [/\bcannot\b/g, 'can not'], [/\b(it|he|she|that|what|where|who|there|here)'s\b/g, '$1 is'], [/'s\b/g, ' is']
]
const DROP = new Set(['a', 'an', 'the'])
const SAME: Record<string, string> = { she: 'he', it: 'he', that: 'this', mom: 'mother', mum: 'mother', dad: 'father', kids: 'children', ok: 'okay' }

function enTokens(s: string): string[] {
  let x = s.toLowerCase().replace(/[’‘]/g, "'")
  for (const [re, r] of CONTRACTIONS) x = x.replace(re, r)
  return x.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(t => t && !DROP.has(t)).map(t => SAME[t] ?? t)
}
const roTokens = (s: string) => s.split(/\s+/).map(w => normRoman(w)).filter(Boolean)
const dvTokens = (s: string) => s.split(/[\s।,.!?]+/).map(normDeva).filter(Boolean)

function dist(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}
const near = (a: string, b: string) => a === b || (Math.max(a.length, b.length) >= 4 && dist(a, b) <= (Math.max(a.length, b.length) >= 8 ? 2 : 1))

/** Longest common subsequence of tokens with fuzzy equality; returns matched count and which expected tokens matched. */
function align(exp: string[], got: string[]) {
  const n = exp.length, m = got.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = near(exp[i], got[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const hitExp = Array(n).fill(false), hitGot = Array(m).fill(false)
  let i = 0, j = 0
  while (i < n && j < m) {
    if (near(exp[i], got[j]) && dp[i][j] === dp[i + 1][j + 1] + 1) { hitExp[i] = hitGot[j] = true; i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return { matched: dp[0][0], hitExp, hitGot }
}

export interface SentenceVerdict { correct: boolean; score: number; gotHits: boolean[]; gotWords: string[] }
export const PASS = 0.8

export function checkSentence(expected: { hi: string; en: string }, dir: 'en-hi' | 'hi-en', input: string): SentenceVerdict {
  const gotWords = input.trim().split(/\s+/).filter(Boolean)
  let exp: string[], got: string[]
  if (dir === 'hi-en') { exp = enTokens(expected.en); got = gotWords.map(w => enTokens(w).join(' ')) }
  else if (isDevanagari(input)) { exp = dvTokens(expected.hi); got = gotWords.map(normDeva) }
  else { exp = roTokens(devToRoman(expected.hi)); got = gotWords.map(w => normRoman(w)) }
  // tokens from a single typed word may be empty (e.g. "the"); keep positions for highlighting
  const idx: number[] = [], gotFlat: string[] = []
  got.forEach((g, k) => { for (const t of g.split(' ').filter(Boolean)) { gotFlat.push(t); idx.push(k) } })
  const { matched, hitGot } = align(exp, gotFlat)
  const score = exp.length ? matched / Math.max(exp.length, gotFlat.length) : 0
  const gotHits = gotWords.map((_, k) => {
    const pos = idx.map((v, p) => (v === k ? p : -1)).filter(p => p >= 0)
    return pos.length === 0 || pos.every(p => hitGot[p])
  })
  return { correct: score >= PASS, score, gotHits, gotWords }
}
