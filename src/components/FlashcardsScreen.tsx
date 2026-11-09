import { useState } from 'react'
import { ORN } from '../data'
import { DECKS, type Deck } from '../data/flashcards'
import PageTitle from './PageTitle'
import Svg from './Svg'
import { FlipCard, type GameSetup } from './WordsGame'

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** Home → Flashcards: the list of decks. */
export function DeckList({ onHome, onOpen }: { onHome: () => void; onOpen: (id: string) => void }) {
  return (
    <div className="wrap cards-page" data-tab="adjectives">
      <div className="topnav"><button className="homebtn" type="button" onClick={onHome}>‹ Home</button></div>
      <PageTitle tab="adjectives" title="Flashcards" hi="फ़्लैशकार्ड" />
      <ul className="decks">
        {DECKS.map(d => (
          <li key={d.id}>
            <button className="deck-row" type="button" onClick={() => onOpen(d.id)}>
              <Svg html={ORN.bullet.adjectives} />
              <span className="dr-text">
                <span className="dr-t">{d.title}</span>
                <span className="dr-d">{d.words.length} cards · <span lang="hi">{d.hi}</span></span>
              </span>
              <span className="chev" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <p className="soon">More sections coming soon.</p>
      <footer><Svg html={ORN.footer} /></footer>
    </div>
  )
}

/** One deck: two columns of flip cards and a shortcut to play its words. */
export function DeckView({ deck, onBack, onPlay }: { deck: Deck; onBack: () => void; onPlay: (s: GameSetup) => void }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const toggle = (k: number) => setFlipped(p => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n })
  const play = () => onPlay({
    mode: 'en-hi', source: 'all', cats: [...new Set(deck.words.map(w => w.cat))], count: deck.words.length,
    from: 'cards', deck: deck.id, key: Date.now(),
    replay: shuffle(deck.words).map(w => ({ w, dir: 'en-hi' as const })),
  })
  return (
    <div className="wrap cards-page" data-tab="adjectives">
      <div className="topnav"><button className="homebtn" type="button" onClick={onBack}>‹ Flashcards</button></div>
      <div className="deck-head">
        <h2>{deck.title}</h2>
        <p lang="hi">{deck.hi}</p>
      </div>
      <div className="deck-bar">
        <span className="deck-d">{deck.words.length} cards · tap a card to see the Hindi</span>
        <button className="deck-play" type="button" onClick={play}>▶ Play these words</button>
      </div>
      <ul className="fc-grid two">
        {deck.words.map((w, k) => (
          <li key={k}><FlipCard w={w} front="en" flipped={flipped.has(k)} onToggle={() => toggle(k)} /></li>
        ))}
      </ul>
      <footer><Svg html={ORN.footer} /></footer>
    </div>
  )
}
