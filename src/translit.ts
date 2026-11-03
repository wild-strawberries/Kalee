// Rough Devanagari → romanized Hindi (Hinglish-style) transliteration, used only to accept romanized answers.
const CONS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'फ़': 'f', 'ड़': 'd', 'ढ़': 'dh', 'य़': 'y'
}
const NUKTA_MAP: Record<string, string> = { 'क': 'क़', 'ख': 'ख़', 'ग': 'ग़', 'ज': 'ज़', 'फ': 'फ़', 'ड': 'ड़', 'ढ': 'ढ़' }
const VOW: Record<string, string> = { 'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'o' }
const MATRA: Record<string, string> = { 'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o' }
const VIRAMA = '्', NUKTA = '़'

type Syl = { c: string; v: string | null; inherent: boolean; nasal?: boolean; candra?: boolean } // v null = virama (no vowel)

function word(w: string): string {
  const chars = [...w.normalize('NFC')]
  const syl: Syl[] = []
  for (let i = 0; i < chars.length; i++) {
    let ch = chars[i]
    if (chars[i + 1] === NUKTA && NUKTA_MAP[ch]) { ch = NUKTA_MAP[ch]; i++ }
    if (CONS[ch] !== undefined) {
      const nx = chars[i + 1]
      if (nx === VIRAMA) { syl.push({ c: CONS[ch], v: null, inherent: false }); i++ }
      else if (nx && MATRA[nx]) { syl.push({ c: CONS[ch], v: MATRA[nx], inherent: false }); i++ }
      else syl.push({ c: CONS[ch], v: 'a', inherent: true })
    } else if (VOW[ch]) syl.push({ c: '', v: VOW[ch], inherent: false })
    else if (ch === 'ं' || ch === 'ँ') { if (syl.length) { syl[syl.length - 1].nasal = true; if (ch === 'ँ') syl[syl.length - 1].candra = true } }
    else if (ch === 'ः') syl.push({ c: 'h', v: null, inherent: false })
    else if (/[a-zA-Z0-9]/.test(ch)) syl.push({ c: ch, v: null, inherent: false })
  }
  // schwa deletion: final inherent a, and medial a in the pattern V C(a) C V
  if (syl.length > 1) {
    const last = syl[syl.length - 1]
    if (last.inherent && !last.nasal) last.v = null
    for (let i = syl.length - 2; i >= 1; i--) {
      const s = syl[i], p = syl[i - 1], n = syl[i + 1]
      if (s.inherent && !s.nasal && p.v !== null && n.c && n.v !== null) { s.v = null; i-- }
    }
  }
  return syl.map((s, k) => {
    let n = ''
    if (s.nasal) {
      const next = syl[k + 1]
      if (!next) n = s.candra && syl.length === 1 && s.c === 'm' ? '' : 'n'   // माँ → maa, हूँ → hoon, हैं → hain
      else n = /^(p|b|m)/.test(next.c) ? 'm' : 'n'              // कंबल → kambal
    }
    return s.c + (s.v ?? '') + n
  }).join('')
}

export function devToRoman(s: string): string {
  return s.split(/[\s।॥,.!?;:"'()\-–—]+/).filter(Boolean).map(word).join(' ')
}
