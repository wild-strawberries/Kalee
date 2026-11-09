import { useEffect, useState } from 'react'
import Home from './components/Home'
import Study from './components/Study'
import Play from './components/Play'
import WordsGame, { type GameSetup } from './components/WordsGame'
import FlashcardsScreen from './components/FlashcardsScreen'
import SentencesGame, { type SentenceSetup } from './components/SentencesGame'

type Route = 'home' | 'study' | 'play' | 'cards' | 'words' | 'sentences'
const readRoute = (): Route => {
  const h = location.hash.replace(/^#\/?/, '')
  return (['study', 'play', 'cards', 'words', 'sentences'] as Route[]).includes(h as Route) ? (h as Route) : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [setup, setSetup] = useState<GameSetup | null>(null)
  const [ssetup, setSSetup] = useState<SentenceSetup | null>(null)

  useEffect(() => {
    const on = () => setRoute(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [route])

  const go = (r: Route) => { location.hash = r === 'home' ? '' : `/${r}` ; setRoute(r) }

  if (route === 'words' && setup) return <WordsGame key={setup.key} setup={setup} onClose={() => go('home')} onRecap={s => setSetup(s)} onQuit={() => go(setup.from === 'cards' ? 'cards' : 'play')} />
  if (route === 'sentences' && ssetup) return <SentencesGame key={ssetup.key} setup={ssetup} onClose={() => go('home')} onRecap={s => setSSetup(s)} onQuit={() => go('play')} />
  if (route === 'cards') return <FlashcardsScreen onHome={() => go('home')} onPlay={s => { setSetup(s); go('words') }} />
  if (route === 'study') return <Study onHome={() => go('home')} />
  if (route === 'play' || route === 'words' || route === 'sentences') return <Play onHome={() => go('home')} onStart={s => { setSetup(s); go('words') }} onStartSentences={s => { setSSetup(s); go('sentences') }} />
  return <Home onGo={go} />
}
