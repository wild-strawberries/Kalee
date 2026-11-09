import { useEffect, useState } from 'react'
import Home from './components/Home'
import Study from './components/Study'
import Play from './components/Play'
import WordsGame, { type GameSetup } from './components/WordsGame'
import { DeckList, DeckView } from './components/FlashcardsScreen'
import { DECKS } from './data/flashcards'
import SentencesGame, { type SentenceSetup } from './components/SentencesGame'

type Route = 'home' | 'study' | 'play' | 'cards' | 'words' | 'sentences'
const readDeck = (): string | null => {
  const m = location.hash.match(/^#\/?cards\/([\w-]+)/)
  return m && DECKS.some(d => d.id === m[1]) ? m[1] : null
}
const readRoute = (): Route => {
  const h = location.hash.replace(/^#\/?/, '').split('/')[0]
  return (['study', 'play', 'cards', 'words', 'sentences'] as Route[]).includes(h as Route) ? (h as Route) : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [setup, setSetup] = useState<GameSetup | null>(null)
  const [ssetup, setSSetup] = useState<SentenceSetup | null>(null)
  const [deck, setDeck] = useState<string | null>(readDeck)

  useEffect(() => {
    const on = () => { setRoute(readRoute()); setDeck(readDeck()) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [route])

  const go = (r: Route, d: string | null = null) => {
    location.hash = r === 'home' ? '' : r === 'cards' && d ? `/cards/${d}` : `/${r}`
    setRoute(r); setDeck(r === 'cards' ? d : null)
  }

  if (route === 'words' && setup) return <WordsGame key={setup.key} setup={setup} onClose={() => go('home')} onRecap={s => setSetup(s)} onQuit={() => (setup.from === 'cards' ? go('cards', setup.deck ?? null) : go('play'))} />
  if (route === 'sentences' && ssetup) return <SentencesGame key={ssetup.key} setup={ssetup} onClose={() => go('home')} onRecap={s => setSSetup(s)} onQuit={() => go('play')} />
  if (route === 'cards') {
    const d = DECKS.find(x => x.id === deck)
    return d
      ? <DeckView key={d.id} deck={d} onBack={() => go('cards')} onPlay={s => { setSetup(s); go('words') }} />
      : <DeckList onHome={() => go('home')} onOpen={id => go('cards', id)} />
  }
  if (route === 'study') return <Study onHome={() => go('home')} />
  if (route === 'play' || route === 'words' || route === 'sentences') return <Play onHome={() => go('home')} onStart={s => { setSetup(s); go('words') }} onStartSentences={s => { setSSetup(s); go('sentences') }} />
  return <Home onGo={go} />
}
