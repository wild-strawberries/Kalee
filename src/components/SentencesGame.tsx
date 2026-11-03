import { useEffect, useMemo, useRef, useState } from 'react'
import SENTENCES from '../data/sentences.json'
import { checkSentence } from '../sentenceCheck'
import { devToRoman } from '../translit'
import { difficulty } from '../stats'
import { forgiveSent, loadSentStats, recordSent } from '../sentStats'
import type { Direction } from '../check'
import type { WordStat } from '../stats'

export type Level = 'easy' | 'medium' | 'hard'
export type SMode = 'en-hi' | 'hi-en' | 'mixed'
export type SSource = 'all' | 'difficult'
export interface Sentence { id: number; level: Level; hi: string; en: string; theme?: string }
export interface SentenceSetup { mode: SMode; level: Level; source: SSource; count: number; key: number; replay?: { s: Sentence; dir: Direction }[] }
export const ALL_SENTENCES = SENTENCES as Sentence[]
export const LEVEL_LABEL: Record<Level, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export function sentencePool(s: Pick<SentenceSetup, 'level' | 'source'>, stats: Record<string, WordStat>): Sentence[] {
  let pool = ALL_SENTENCES.filter(x => x.level === s.level)
  if (s.source === 'difficult') pool = pool.filter(x => difficulty(stats[x.id]) > 0).sort((a, b) => difficulty(stats[b.id]) - difficulty(stats[a.id]))
  return pool
}

type Item = { s: Sentence; dir: Direction }
type Result = Item & { answer: string; correct: boolean; overridden?: boolean }

function Expected({ it }: { it: Item }) {
  return it.dir === 'en-hi'
    ? <span className="ans s-ans"><b lang="hi" className="s-dv">{it.s.hi}</b><span className="s-ro">{devToRoman(it.s.hi)}</span></span>
    : <span className="ans s-ans"><b>{it.s.en}</b></span>
}

export default function SentencesGame({ setup, onClose, onRecap, onQuit }: {
  setup: SentenceSetup; onClose: () => void; onRecap: (s: SentenceSetup) => void; onQuit: () => void
}) {
  const items: Item[] = useMemo(() => setup.replay ?? (() => {
    const pool = sentencePool(setup, loadSentStats())
    const picked = setup.source === 'difficult' ? shuffle(pool.slice(0, setup.count)) : shuffle(pool).slice(0, setup.count)
    return picked.map(s => ({ s, dir: (setup.mode === 'mixed' ? (Math.random() < 0.5 ? 'en-hi' : 'hi-en') : setup.mode) as Direction }))
  })(), [setup])
  const [i, setI] = useState(0)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [shown, setShown] = useState<(Result & { hits: boolean[]; words: string[] }) | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)
  const done = results.length === items.length && !shown
  useEffect(() => { ref.current?.focus() }, [i, shown])

  const right = results.filter(r => r.correct).length
  const wrong = results.length - right

  const submit = (skip = false) => {
    if (shown) return next()
    const it = items[i]
    if (!skip && !input.trim()) return
    const v = skip ? { correct: false, gotHits: [], gotWords: [] } : checkSentence(it.s, it.dir, input)
    const r: Result = { ...it, answer: skip ? '' : input.trim(), correct: v.correct }
    recordSent(it.s.id, r.correct)
    setResults(p => [...p, r])
    setShown({ ...r, hits: v.gotHits, words: v.gotWords })
  }
  const override = () => {
    if (!shown || shown.correct) return
    forgiveSent(shown.s.id)
    setResults(p => p.map((r, k) => (k === p.length - 1 ? { ...r, correct: true, overridden: true } : r)))
    setShown({ ...shown, correct: true, overridden: true })
  }
  const next = () => { setShown(null); setInput(''); if (i < items.length - 1) setI(i + 1) }

  if (items.length === 0) return (
    <div className="wrap game" data-tab="nouns"><p className="empty">No sentences to practise with these settings.</p><div className="sum-btns"><button className="start" onClick={onQuit}>Back</button></div></div>
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
        {missed.length > 0 && (<>
          <h4 className="sum-h">To review</h4>
          <ul className="sum-list">
            {missed.map((r, k) => (
              <li key={k}>
                <span className="sl-q s-q">{r.dir === 'en-hi' ? r.s.en : <span lang="hi">{r.s.hi}</span>}</span>
                <Expected it={r} />
                {r.answer && <span className="sl-you">you wrote: {r.answer}</span>}
              </li>
            ))}
          </ul>
        </>)}
        <div className="sum-btns">
          {missed.length > 0 && <button className="start" type="button" onClick={() => onRecap({ ...setup, key: Date.now(), replay: shuffle(missed.map(r => ({ s: r.s, dir: r.dir }))) })}>Recap mistakes ({missed.length})</button>}
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
        <div className="prompt">
          <span className="p-cat">{LEVEL_LABEL[it.s.level]} · {it.dir === 'en-hi' ? 'English → Hindi' : 'Hindi → English'}</span>
          {it.dir === 'en-hi' ? <p className="p-sent">{it.s.en}</p> : <p className="p-sent p-sent-dv" lang="hi">{it.s.hi}</p>}
          <span className="p-ask">{it.dir === 'en-hi' ? 'Write it in Hindi (romanized or हिंदी)' : 'Write it in English'}</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); submit() }}>
          <textarea ref={ref} className="g-input s-input" rows={2} value={input} readOnly={!!shown}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder={it.dir === 'en-hi' ? 'Type your translation…' : 'Type the English…'}
            autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint={shown ? 'next' : 'done'} aria-label="Your translation" />
          {shown ? (
            <div className="fb" role="status">
              <p className="fb-t">{shown.correct ? (shown.overridden ? 'Counted as correct' : 'Correct!') : shown.answer ? 'Not quite' : 'The answer is'}</p>
              {shown.answer && !shown.overridden && (
                <p className="yours">{shown.words.map((w, k) => <span key={k} className={shown.hits[k] ? '' : 'miss'}>{w} </span>)}</p>
              )}
              <Expected it={shown} />
              {!shown.correct && shown.answer && <button className="link" type="button" onClick={override}>My answer was right — count it</button>}
              <button className="start" type="submit">{i < items.length - 1 ? 'Next' : 'See results'}</button>
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
