// Flashcard decks shown under Home → Flashcards. Each deck lists words from the Study bank.
import { TABS } from '../data'
import type { Word } from '../types'

export interface Deck { id: string; title: string; hi: string; description: string; words: Word[] }

const verbs = TABS.find(t => t.key === 'verbs')!
const basicVerbs = verbs.sections
  .filter(s => s.name === 'Top 10' || s.name === 'Top 50')
  .flatMap(s => s.items)
  .sort((a, b) => a.en.localeCompare(b.en))

export const DECKS: Deck[] = [
  { id: 'basic-verbs', title: 'Basic verbs', hi: 'मूल क्रियाएँ', description: 'The 50 most common verbs', words: basicVerbs },
]
