import { useState } from 'react'
import { ORN } from '../data'
import { DECKS, type Deck } from '../data/flashcards'
import PageTitle from './PageTitle'
import Svg from './Svg'
import { FlipCard, type Game, type GameSetup, type Mode } from './WordsGame'
import { Pills } from './Play'

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

/** Home → Flashcards: the list of decks. */
export function DeckList({ onHome, onOpen }: { onHome: () => void; onOpen: (id: string) => void }) {
  return (
    <div className="wrap cards-page" data-tab="adjectives">
      <div className="topnav"><button className="homebtn" type="button" onClick={onHome}>‹ Home</button></div>
      <PageTitle tab="adjectives" title="Flashcards" hi="फ़्लैशकार्ड" />
      <ul className="decks">
        {DECKS.map(d => (
          <li key={d.id} data-tab={d.tab}>
            <button className="deck-row" type="button" onClick={() => onOpen(d.id)}>
              <Svg html={ORN.bullet[d.tab]} />
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
  const [sheet, setSheet] = useState(false)
  const play = (game: Game, mode: Mode) => {
    const unique = deck.words.filter((w, k) => deck.words.findIndex(x => x.id === w.id) === k)   // each word once
    onPlay({
      game, mode, source: 'all', cats: [...new Set(unique.map(w => w.cat))], count: unique.length,
      from: 'cards', deck: deck.id, key: Date.now(),
      replay: shuffle(unique).map(w => ({ w, dir: mode })),
    })
  }
  return (
    <div className="wrap cards-page" data-tab={deck.tab}>
      <div className="topnav"><button className="homebtn" type="button" onClick={onBack}>‹ Flashcards</button></div>
      <div className="deck-head">
        <h2>{deck.title}</h2>
        <p lang="hi">{deck.hi}</p>
      </div>
      <div className="deck-bar">
        <span className="deck-d">{deck.words.length} cards · tap a card to see the Hindi</span>
        <button className="deck-play" type="button" onClick={() => setSheet(true)} aria-haspopup="dialog">▶ Play these words</button>
      </div>
      <ul className="fc-grid two">
        {deck.words.map((w, k) => (
          <li key={k}><FlipCard w={w} front="en" flipped={flipped.has(k)} onToggle={() => toggle(k)} /></li>
        ))}
      </ul>
      <footer><Svg html={ORN.footer} /></footer>
      {sheet && <PlaySheet count={new Set(deck.words.map(w => w.id)).size} onCancel={() => setSheet(false)} onStart={(g, m) => { setSheet(false); play(g, m) }} />}
    </div>
  )
}

const DECK_PREFS = 'kalee-deck-play'
function PlaySheet({ count, onCancel, onStart }: { count: number; onCancel: () => void; onStart: (g: Game, m: Mode) => void }) {
  const [p, setP] = useState<{ game: Game; mode: Mode }>(() => {
    try { return { game: 'words', mode: 'en-hi', ...JSON.parse(localStorage.getItem(DECK_PREFS) || '{}') } } catch { return { game: 'words', mode: 'en-hi' } }
  })
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="deck-play-t" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="sheet setup">
        <button className="x" type="button" onClick={onCancel}>Close</button>
        <h2 id="deck-play-t">Play these words</h2>
        <p className="setup-sub">All {count} words, each once, in random order.</p>
        <h4>Game</h4>
        <Pills value={p.game} onChange={v => setP({ ...p, game: v })} options={[
          { v: 'words', label: 'Words', hint: 'type it' }, { v: 'match', label: 'Recognition', hint: 'pick from 6' }]} />
        <h4>Direction</h4>
        <Pills value={p.mode} onChange={v => setP({ ...p, mode: v })} options={[
          { v: 'en-hi', label: 'English → Hindi' }, { v: 'hi-en', label: 'Hindi → English' }]} />
        <button className="start" type="button" onClick={() => {
          try { localStorage.setItem(DECK_PREFS, JSON.stringify(p)) } catch { /* */ }
          onStart(p.game, p.mode)
        }}>Start</button>
      </div>
    </div>
  )
}
