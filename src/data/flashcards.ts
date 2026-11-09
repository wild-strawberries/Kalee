// Flashcard decks shown under Home → Flashcards. Each card points at a word in the Study bank;
// `label` can override the English shown on the card. Cards are listed row by row (left, right).
import { BANK, type BankWord } from '../data'
import type { TabKey } from '../types'

/** `tab` sets the deck's colour and flower, matching the Study tab (verbs = pink). */
export interface Deck { id: string; title: string; hi: string; description: string; tab: TabKey; words: BankWord[] }

const card = (id: string, label?: string): BankWord => {
  const w = BANK.find(b => b.id === id)
  if (!w) throw new Error(`Flashcards: no word "${id}"`)
  return label ? { ...w, en: label } : w
}
const v = (en: string, label?: string) => card(`verbs:${en}`, label)

export const DECKS: Deck[] = [
  {
    id: 'basic-verbs', title: 'Basic verbs', hi: 'मूल क्रियाएँ', description: 'Everyday verbs in pairs', tab: 'verbs',
    words: [
      v('be'), v('do'),
      v('come'), v('go'),
      v('like'), v('want'),
      v('eat'), v('drink'),
      v('take'), v('give'),
      v('see'), v('look (seem)'),
      v('taste'), v('smell'),
      v('hear', 'hear / listen'), v('understand'),
      v('speak'), v('say'),
      v('tell'), v('talk'),
      v('think'), v('decide'),
      v('study', 'study / read'), v('write'),
      v('remember'), v('forget'),
      v('teach'), v('learn'),
      v('ask for something', 'ask (for something)'), v('ask'),
      v('laugh'), v('cry'),
      v('play'), v('do work'),
      v('sleep'), v('wake up'),
      v('open'), v('close'),
      v('walk'), v('run'),
      v('jump'), v('carry', 'carry / lift'),
      v('sit'), v('stand'),
      v('fall'), v('get up'),
      v('stop'), v('continue'),
      v('live (reside)', 'live (residency)'), v('live', 'live (life)'),
      v('drive'), v('travel'),
      v('cook'), v('clean'),
      v('cut'), v('peel (off)', 'peel'),
      v('dance'), v('sing'),
      v('build'), v('break'),
    ],
  },
]
