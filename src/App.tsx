import { useEffect, useState } from 'react'
import Home from './components/Home'
import Study from './components/Study'
import Play from './components/Play'
import WordsGame, { type GameSetup } from './components/WordsGame'

type Route = 'home' | 'study' | 'play' | 'words'
const readRoute = (): Route => {
  const h = location.hash.replace(/^#\/?/, '')
  return (['study', 'play', 'words'] as Route[]).includes(h as Route) ? (h as Route) : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [setup, setSetup] = useState<GameSetup | null>(null)

  useEffect(() => {
    const on = () => setRoute(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [route])

  const go = (r: Route) => { location.hash = r === 'home' ? '' : `/${r}` ; setRoute(r) }

  if (route === 'words' && setup) return <WordsGame key={setup.key} setup={setup} onClose={() => go('home')} onRecap={s => setSetup(s)} onQuit={() => go('play')} />
  if (route === 'study') return <Study onHome={() => go('home')} />
  if (route === 'play' || route === 'words') return <Play onHome={() => go('home')} onStart={s => { setSetup(s); go('words') }} />
  return <Home onGo={go} />
}
