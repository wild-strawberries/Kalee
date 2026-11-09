// Flashcard decks shown under Home → Flashcards. Each card points at a word in the Study bank;
// `label` can override the English shown on the card. Cards are listed row by row (left, right).
import { BANK, type BankWord } from '../data'

export interface Deck { id: string; title: string; hi: string; description: string; words: BankWord[] }

const card = (id: string, label?: string): BankWord => {
  const w = BANK.find(b => b.id === id)
  if (!w) throw new Error(`Flashcards: no word "${id}"`)
  return label ? { ...w, en: label } : w
}
const v = (en: string, label?: string) => card(`verbs:${en}`, label)

export const DECKS: Deck[] = [
  {
    id: 'basic-verbs', title: 'Basic verbs', hi: 'मूल क्रियाएँ', description: 'Everyday verbs in pairs',
    words: [
      v('be'), v('do'),
      v('come'), v('go'),
      v('like'), v('want'),
      v('eat'), v('drink'),
      v('take'), v('give'),
      v('hear'), v('smell'),
      v('see'), v('look (seem)'),
      v('speak'), v('say'),
      v('tell'), v('talk'),
      v('think'), v('decide'),
      v('study', 'study / read'), v('write'),
      v('laugh'), v('cry'),
      v('play'), v('do work'),
      v('wake up'), v('sleep'),
      v('walk'), v('run'),
      v('sit'), v('stand'),
      v('live (reside)', 'live (residency)'), v('live', 'live (life)'),
      v('drive'), v('travel'),
      v('cook'), v('clean'),
      v('dance'), v('sing'),
    ],
  },
]
