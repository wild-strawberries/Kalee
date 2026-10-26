// Forgiving answer checking for romanized Hindi, Devanagari and English.
import { BANK, type BankWord } from './data'

const DEVANAGARI = /[ऀ-ॿ]/
export const isDevanagari = (s: string) => DEVANAGARI.test(s)

/** Collapse the spelling variations of romanized Hindi so that e.g. jaana/jana, chhodna/chodna, chaay/chai match. */
export function normRoman(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map(w => {
      let x = w
      x = x.replace(/chh/g, 'ch').replace(/([kgtdbjp])h/g, '$1').replace(/sh/g, 's')
      x = x.replace(/w/g, 'v').replace(/z/g, 'j').replace(/q/g, 'k').replace(/f/g, 'p')
      x = x.replace(/ee/g, 'i').replace(/oo/g, 'u')
      x = x.replace(/(.)\1+/g, '$1')                 // aa → a, nn → n, kk → k …
      x = x.replace(/y$/, 'i').replace(/ai/g, 'e').replace(/ay/g, 'e').replace(/au|ou/g, 'o')
      x = x.replace(/n(?=[^aeiou])/g, '')           // nasal n before a consonant (hansna / hasna)
      x = x.replace(/([aeiou])[nh]$/, '$1')          // final nasal / h (yahaan, nahin, subah)
      return x
    }).join('')
}

/** Normalise Devanagari: ignore nukta, chandrabindu/anusvara and spacing differences. */
export function normDeva(s: string): string {
  return s.normalize('NFC')
    .replace(/[़ँं‌‍]/g, '')
    .replace(/[\s\-–—.,;!?'"()/।]/g, '')
}

export function normEnglish(s: string): string {
  return s.toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .replace(/^to /, '')
    .replace(/^(a|an|the) /, '')
}

/** Split "bhaagna; daudna", "samay / vakt bitaana", "(gaadi) lagaana" into all acceptable forms. */
export function alternatives(s: string): string[] {
  const out = new Set<string>()
  for (const part of s.split(';').map(x => x.trim()).filter(Boolean)) {
    let forms = [part]
    if (part.includes(' / ')) {
      const bits = part.split(' / ').map(x => x.trim())
      const last = bits[bits.length - 1].split(' ')
      const suffix = last.slice(1).join(' ')
      forms = [...bits.slice(0, -1).map(b => (suffix ? `${b} ${suffix}` : b)), bits[bits.length - 1]]
    }
    for (const f of forms) {
      out.add(f.replace(/[()]/g, '').trim())             // with the optional part
      out.add(f.replace(/\([^)]*\)/g, '').trim())        // without it
    }
  }
  return [...out].filter(Boolean)
}

function englishAlternatives(en: string): string[] {
  const out = new Set<string>()
  for (const p of en.split(/[,;]/).map(x => x.trim()).filter(Boolean)) {
    out.add(normEnglish(p.replace(/[()]/g, '')))
    out.add(normEnglish(p.replace(/\([^)]*\)/g, '')))
  }
  return [...out].filter(Boolean)
}

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

const close = (a: string, b: string) => a === b || (b.length >= 5 && distance(a, b) <= 1)

export type Direction = 'en-hi' | 'hi-en'
export interface Verdict { correct: boolean; typo: boolean }

/** Words in the same category that share this word's Hindi (e.g. maanna = admit / agree / assume / consider). */
function sameHindi(w: BankWord): BankWord[] {
  const key = normRoman(w.ro)
  return BANK.filter(b => b.cat === w.cat && normRoman(b.ro) === key)
}
/** Words in the same category that share this word's English (any of its comma-separated meanings). */
function sameEnglish(w: BankWord): BankWord[] {
  const mine = new Set(englishAlternatives(w.en))
  return BANK.filter(b => b.cat === w.cat && englishAlternatives(b.en).some(e => mine.has(e)))
}

export function check(w: BankWord, dir: Direction, input: string): Verdict {
  const raw = input.trim()
  if (!raw) return { correct: false, typo: false }
  if (dir === 'hi-en') {
    const given = normEnglish(raw)
    const accepted = sameHindi(w).flatMap(b => englishAlternatives(b.en))
    if (accepted.includes(given)) return { correct: true, typo: false }
    if (accepted.some(a => close(given, a))) return { correct: true, typo: true }
    return { correct: false, typo: false }
  }
  const words = sameEnglish(w)
  if (isDevanagari(raw)) {
    const given = normDeva(raw)
    const accepted = words.flatMap(b => [...alternatives(b.dv), ...(b.pl ? [b.pl[1]] : [])]).map(normDeva)
    return { correct: accepted.includes(given), typo: false }
  }
  const given = normRoman(raw)
  const accepted = words.flatMap(b => [...alternatives(b.ro), ...(b.pl ? [b.pl[0]] : [])]).map(normRoman)
  if (accepted.includes(given)) return { correct: true, typo: false }
  if (accepted.some(a => close(given, a))) return { correct: true, typo: true }
  return { correct: false, typo: false }
}

/** All the English meanings that count as right for a Hindi prompt (shown in feedback). */
export function englishAnswers(w: BankWord): string[] {
  return [...new Set(sameHindi(w).map(b => b.en))]
}
