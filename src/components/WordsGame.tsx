import { useEffect, useMemo, useRef, useState } from 'react'
import { BANK, CATEGORY, type BankWord } from '../data'
import { check, englishAnswers, type Direction } from '../check'
import { difficulty, loadStats, record, type WordStat } from '../stats'
import type { TabKey } from '../types'
import { English, Romanized, devanagari } from './WordRow'

export type Mode = 'en-hi' | 'hi-en' | 'mixed'
export type Source = 'all' | 'common' | 'difficult'
export interface GameSetup { mode: Mode; source: Source; cats: TabKey[]; count: number; key: number; replay?: { w: BankWord; dir: Direction }[] }

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export function buildQueue(s: GameSetup, stats: Record<string, WordStat>, n = s.count): BankWord[] {
  let pool = BANK.filter(w => s.cats.includes(w.cat))
  if (s.source === 'common') pool = pool.filter(w => w.top)
  if (s.source === 'difficult') {
    pool = pool.filter(w => difficulty(stats[w.id]) > 0).sort((a, b) => difficulty(stats[b.id]) - difficulty(stats[a.id]))
    return shuffle(pool.slice(0, n))
  }
  return shuffle(pool).slice(0, n)
}

type Item = { w: BankWord; dir: Direction }
type Result = Item & { answer: string; correct: boolean; typo: boolean }

function Prompt({ it }: { it: Item }) {
  const { w, dir } = it
  return (
    <div className="prompt">
      <span className="p-cat">{CATEGORY[w.cat]}{w.tag ? ` · ${w.tag}` : ''}</span>
      {dir === 'en-hi'
        ? <p className="p-en">{w.cat === 'verbs' && <i>to </i>}<English text={w.en} /></p>
        : <><p className="p-ro">{w.ro}</p><p className="p-dv" lang="hi">{w.dv}</p></>}
      <span className="p-ask">{dir === 'en-hi' ? 'Type it in Hindi (romanized or हिंदी)' : 'Type it in English'}</span>
    </div>
  )
}

function Answer({ it }: { it: Item }) {
  const { w, dir } = it
  if (dir === 'en-hi') return <span className="ans"><b><Romanized w={w} /></b> <span lang="hi">{devanagari(w)}</span></span>
  return <span className="ans"><b>{englishAnswers(w).map((e, i) => <span key={e}>{i ? ' · ' : ''}{w.cat === 'verbs' ? 'to ' : ''}<English text={e} /></span>)}</b></span>
}

export default function WordsGame({ setup, onClose, onRecap, onQuit }: {
  setup: GameSetup; onClose: () => void; onRecap: (s: GameSetup) => void; onQuit: () => void
}) {
  const items: Item[] = useMemo(() => setup.replay ?? buildQueue(setup, loadStats()).map(w => ({
    w, dir: setup.mode === 'mixed' ? (Math.random() < 0.5 ? 'en-hi' : 'hi-en') : setup.mode
  })), [setup])
  const [i, setI] = useState(0)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [shown, setShown] = useState<Result | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const done = results.length === items.length && !shown

  useEffect(() => { inputRef.current?.focus() }, [i, shown])

  const right = results.filter(r => r.correct).length
  const wrong = results.length - right

  const submit = (skip = false) => {
    if (shown) return next()
    const it = items[i]
    if (!skip && !input.trim()) return
    const v = skip ? { correct: false, typo: false } : check(it.w, it.dir, input)
    const r: Result = { ...it, answer: skip ? '' : input.trim(), ...v }
    record(it.w.id, r.correct)
    setResults(p => [...p, r])
    setShown(r)
  }
  const next = () => {
    setShown(null); setInput('')
    if (i < items.length - 1) setI(i + 1)
  }

  if (items.length === 0) return (
    <div className="wrap game" data-tab="nouns"><p className="empty">No words to practise with these settings.</p><div className="sum-btns"><button className="start" onClick={onQuit}>Back</button></div></div>
  )

  if (done) {
    const missed = results.filter(r => !r.correct)
    return (
      <div className="wrap game summary" data-tab="nouns">
        <h2 className="sum-t">Round complete</h2>
        <div className="sum-score">
          <div className="sc ok"><span className="n">{right}</span><span className="l">correct</span></div>
          <div className="sc bad"><span className="n">{wrong}</span><span className="l">incorrect</span></div>
        </div>
        {missed.length > 0 && (
          <>
            <h4 className="sum-h">To review</h4>
            <ul className="sum-list">
              {missed.map((r, k) => (
                <li key={k}>
                  <span className="sl-q">{r.dir === 'en-hi' ? <>{r.w.cat === 'verbs' && 'to '}<English text={r.w.en} /></> : <>{r.w.ro} <span lang="hi" className="mut">{r.w.dv}</span></>}</span>
                  <Answer it={r} />
                  {r.answer && <span className="sl-you">you wrote: {r.answer}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="sum-btns">
          {missed.length > 0 && <button className="start" type="button" onClick={() => onRecap({ ...setup, key: Date.now(), replay: shuffle(missed.map(r => ({ w: r.w, dir: r.dir }))) })}>Recap mistakes ({missed.length})</button>}
          <button className="ghost" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  const it = items[i]
  return (
    <div className="wrap game" data-tab="nouns">
      <div className="g-bar">
        <button className="homebtn" type="button" onClick={onQuit} aria-label="Quit round">✕ Quit</button>
        <span className="g-pos">{i + 1} / {items.length}</span>
        <span className="g-score"><span className="ok">✓ {right}</span><span className="bad">✗ {wrong}</span></span>
      </div>
      <div className="g-progress"><span style={{ width: `${(results.length / items.length) * 100}%` }} /></div>

      <div className={`card${shown ? (shown.correct ? ' is-ok' : ' is-bad') : ''}`}>
        <Prompt it={it} />
        <form onSubmit={e => { e.preventDefault(); submit() }}>
          <input ref={inputRef} className="g-input" value={input} onChange={e => setInput(e.target.value)} readOnly={!!shown}
            placeholder={it.dir === 'en-hi' ? 'e.g. khaana / खाना' : 'e.g. to eat'} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint={shown ? 'next' : 'done'} aria-label="Your answer" />
          {shown ? (
            <div className="fb" role="status">
              <p className="fb-t">{shown.correct ? (shown.typo ? 'Correct — watch the spelling' : 'Correct!') : shown.answer ? 'Not quite' : 'The answer is'}</p>
              <Answer it={shown} />
              <button ref={nextRef} className="start" type="submit">{i < items.length - 1 ? 'Next' : 'See results'}</button>
            </div>
          ) : (
            <div className="g-actions">
              <button className="ghost" type="button" onClick={() => submit(true)}>I don’t know</button>
              <button className="start" type="submit" disabled={!input.trim()}>Check</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
