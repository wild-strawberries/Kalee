export type TabKey = 'nouns' | 'adverbs' | 'adjectives' | 'verbs'

export interface Word {
  id: string          // "<tab>:<english>"
  en: string          // English, without the leading "to" for verbs
  ro: string          // romanized Hindi
  dv: string          // Devanagari
  top: boolean        // among the most common words
  note?: string
  tag?: string        // noun gender (m / f)
  pl?: [string, string] // noun plural: romanized, Devanagari
}

export interface Section { name: string; sub?: string; open?: boolean; items: Word[] }
export interface Tab { key: TabKey; title: string; hi: string; count: number; sections: Section[] }
