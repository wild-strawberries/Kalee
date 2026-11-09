import { useState } from 'react'
import { BANK, ORN } from '../data'
import { DECKS } from '../data/flashcards'
import PageTitle from './PageTitle'
import Svg from './Svg'
import { FlipCard, type GameSetup } from './WordsGame'

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function FlashcardsScreen({ onHome, onPlay }: { onHome: () => void; onPlay: (s: GameSetup) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ [DECKS[0].id]: true })
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setFlipped(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const play = (deckId: string) => {
    const deck = DECKS.find(d => d.id === deckId)!
    const words = deck.words.map(w => BANK.find(b => b.id === w.id)!).filter(Boolean)
    onPlay({
      mode: 'en-hi', source: 'all', cats: ['verbs'], count: words.length, from: 'cards', key: Date.now(),
      replay: shuffle(words).map(w => ({ w, dir: 'en-hi' as const })),
    })
  }

  return (
    <div className="wrap cards-page" data-tab="adjectives">
      <div className="topnav"><button className="homebtn" type="button" onClick={onHome}>‹ Home</button></div>
      <PageTitle tab="adjectives" title="Flashcards" hi="फ़्लैशकार्ड" />
      <p className="fc-hint">Tap a card to see the Hindi.</p>
      {DECKS.map(d => (
        <details key={d.id} className="sec deck" open={!!open[d.id]}
          onToggle={e => { const o = (e.currentTarget as HTMLDetailsElement).open; if (o !== !!open[d.id]) setOpen(p => ({ ...p, [d.id]: o })) }}>
          <summary><Svg html={ORN.bullet.adjectives} /><h3>{d.title} <span className="sub">{d.words.length}</span></h3><span className="chev" aria-hidden="true" /></summary>
          <div className="deck-bar">
            <span className="deck-d">{d.description} · <span lang="hi">{d.hi}</span></span>
            <button className="deck-play" type="button" onClick={() => play(d.id)}>▶ Play these words</button>
          </div>
          <ul className="fc-grid two">
            {d.words.map(w => {
              const bw = BANK.find(b => b.id === w.id)!
              return <li key={w.id}><FlipCard w={bw} front="en" flipped={flipped.has(w.id)} onToggle={() => toggle(w.id)} /></li>
            })}
          </ul>
        </details>
      ))}
      <footer><Svg html={ORN.footer} /></footer>
    </div>
  )
}
