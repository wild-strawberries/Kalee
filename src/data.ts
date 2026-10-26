import lexicon from './data/lexicon.json'
import ornaments from './data/ornaments.json'
import sentence from './data/sentence.json'
import type { Tab, TabKey, Word } from './types'

export const TABS = lexicon as unknown as Tab[]
export const ORN = ornaments as {
  header: string; footer: string
  side: Record<TabKey, string>; sideR: Record<TabKey, string>; bullet: Record<TabKey, string>
}
export const SENTENCE = sentence as {
  example: { ro: string; dv: string; part: number }[]
  exampleEn: string
  colors: string[]
  parts: { name: string; hindi: string; examples: { ro: string; dv: string; en: string }[] }[]
}

export const CATEGORY: Record<TabKey, string> = { nouns: 'noun', adverbs: 'adverb', adjectives: 'adjective', verbs: 'verb' }

/** Every word once, with the tab it belongs to (the Study bank the games draw from). */
export interface BankWord extends Word { cat: TabKey }
export const BANK: BankWord[] = (() => {
  const seen = new Set<string>()
  const out: BankWord[] = []
  for (const t of TABS) for (const s of t.sections) for (const w of s.items) {
    if (seen.has(w.id)) continue
    seen.add(w.id)
    out.push({ ...w, cat: t.key })
  }
  return out
})()
