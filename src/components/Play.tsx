import { useMemo, useState } from 'react'
import { BANK, ORN, TABS } from '../data'
import type { TabKey } from '../types'
import { difficulty, loadStats } from '../stats'
import type { Game, GameSetup, Mode, Source } from './WordsGame'
import { buildQueue } from './WordsGame'
import PageTitle from './PageTitle'
import Svg from './Svg'
import { LEVEL_LABEL, sentencePool, type Level, type SentenceSetup, type SMode, type SSource } from './SentencesGame'
import { loadSentStats } from '../sentStats'

const SPREFS = 'kalee-sentences-setup'
type SPrefs = { mode: SMode; level: Level; source: SSource; count: number }
const SDEFAULTS: SPrefs = { mode: 'en-hi', level: 'easy', source: 'all', count: 10 }
const loadSPrefs = (): SPrefs => { try { return { ...SDEFAULTS, ...JSON.parse(localStorage.getItem(SPREFS) || '{}') } } catch { return SDEFAULTS } }

function SentenceSetupSheet({ onCancel, onStart }: { onCancel: () => void; onStart: (s: SentenceSetup) => void }) {
  const [p, setP] = useState<SPrefs>(loadSPrefs)
  const stats = useMemo(loadSentStats, [])
  const missed = useMemo(() => sentencePool({ level: p.level, source: 'difficult' }, stats).length, [p.level, stats])
  const source: SSource = p.source === 'difficult' && missed === 0 ? 'all' : p.source
  const pool = useMemo(() => sentencePool({ level: p.level, source }, stats).length, [p.level, source, stats])
  const count = Math.min(p.count, Math.max(pool, 1))
  const set = (patch: Partial<SPrefs>) => setP(prev => ({ ...prev, ...patch }))
  const words: Record<Level, string> = { easy: '2–5 words', medium: '6–9 words', hard: '10–15 words' }
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ssetup-t" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="sheet setup">
        <button className="x" type="button" onClick={onCancel}>Close</button>
        <h2 id="ssetup-t">Sentences</h2>
        <p className="setup-sub">Translate whole sentences.</p>
        <h4>Direction</h4>
        <Pills value={p.mode} onChange={v => set({ mode: v })} options={[
          { v: 'en-hi', label: 'English → Hindi' }, { v: 'hi-en', label: 'Hindi → English' }, { v: 'mixed', label: 'Mixed' }]} />
        <h4>Level</h4>
        <Pills value={p.level} onChange={v => set({ level: v })} options={(['easy', 'medium', 'hard'] as Level[]).map(l => ({ v: l, label: LEVEL_LABEL[l], hint: words[l] }))} />
        <h4>Sentences</h4>
        <Pills value={source} onChange={v => set({ source: v })} options={[
          { v: 'all', label: 'All sentences' }, { v: 'difficult', label: 'Most difficult', disabled: missed === 0, hint: missed ? `${missed}` : undefined }]} />
        {missed === 0 && <p className="setup-note">“Most difficult” unlocks once you’ve missed a few sentences at this level.</p>}
        <h4>Sentences per round <span className="cnt">{count}</span></h4>
        <input className="range" type="range" min={1} max={50} value={Math.min(p.count, 50)} onChange={e => set({ count: Number(e.target.value) })} aria-label="Sentences per round" />
        <div className="range-ends"><span>1</span><span>{pool < 50 ? `${pool} available` : '50'}</span></div>
        <button className="start" type="button" disabled={pool === 0} onClick={() => {
          try { localStorage.setItem(SPREFS, JSON.stringify({ ...p, source })) } catch { /* */ }
          onStart({ mode: p.mode, level: p.level, source, count, key: Date.now() })
        }}>Start</button>
      </div>
    </div>
  )
}

const PREFS: Record<Game, string> = { words: 'kalee-words-setup', match: 'kalee-match-setup' }
type Prefs = { mode: Mode; source: Source; cats: TabKey[]; count: number; cards: boolean }
const DEFAULTS: Prefs = { mode: 'en-hi', source: 'all', cats: ['nouns', 'adverbs', 'adjectives', 'verbs'], count: 10, cards: false }
const loadPrefs = (game: Game): Prefs => {
  try {
    const p = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS[game]) || '{}') } as Prefs
    if (p.mode !== 'en-hi' && p.mode !== 'hi-en') p.mode = 'en-hi'   // "mixed" was removed
    return p
  } catch { return DEFAULTS }
}

export function Pills<T extends string>({ value, options, onChange, multi }: {
  value: T | T[]; options: { v: T; label: string; disabled?: boolean; hint?: string }[]; onChange: (v: T) => void; multi?: boolean
}) {
  return (
    <div className="pills" role={multi ? 'group' : 'radiogroup'}>
      {options.map(o => {
        const on = Array.isArray(value) ? value.includes(o.v) : value === o.v
        return (
          <button key={o.v} type="button" className="pill" disabled={o.disabled} role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={() => onChange(o.v)}>
            {o.label}{o.hint && <span className="pill-hint">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

const GAME_TEXT: Record<Game, { t: string; sub: string }> = {
  words: { t: 'Words', sub: 'Type the translation of each word.' },
  match: { t: 'Recognition', sub: 'Pick the right translation out of six.' },
}

function Setup({ game, onCancel, onStart }: { game: Game; onCancel: () => void; onStart: (s: GameSetup) => void }) {
  const [p, setP] = useState<Prefs>(() => loadPrefs(game))
  const stats = useMemo(loadStats, [])
  const missedCount = useMemo(() => BANK.filter(w => p.cats.includes(w.cat) && difficulty(stats[w.id]) > 0).length, [p.cats, stats])
  const source: Source = p.source === 'difficult' && missedCount === 0 ? 'all' : p.source
  const pool = useMemo(() => buildQueue({ ...p, source, key: 0 }, stats, 9999).length, [p, source, stats])
  const count = Math.min(p.count, Math.max(pool, 1))
  const set = (patch: Partial<Prefs>) => setP(prev => ({ ...prev, ...patch }))

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="setup-t" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="sheet setup">
        <button className="x" type="button" onClick={onCancel}>Close</button>
        <h2 id="setup-t">{GAME_TEXT[game].t}</h2>
        <p className="setup-sub">{GAME_TEXT[game].sub}</p>

        <h4>Direction</h4>
        <Pills value={p.mode} onChange={v => set({ mode: v })} options={[
          { v: 'en-hi', label: 'English → Hindi' }, { v: 'hi-en', label: 'Hindi → English' }]} />

        <h4>Flashcards first</h4>
        <Pills value={p.cards ? 'on' : 'off'} onChange={v => set({ cards: v === 'on' })} options={[
          { v: 'off', label: 'Off' }, { v: 'on', label: 'On' }]} />
        <p className="setup-note">Review the round’s words as flip cards before you start.</p>

        <h4>Words</h4>
        <Pills value={source} onChange={v => set({ source: v })} options={[
          { v: 'all', label: 'All words' }, { v: 'common', label: 'Most common' },
          { v: 'difficult', label: 'Most difficult', disabled: missedCount === 0, hint: missedCount ? `${missedCount}` : undefined }]} />
        {missedCount === 0 && <p className="setup-note">“Most difficult” unlocks once you’ve missed a few words.</p>}

        <h4>Word types</h4>
        <Pills multi value={p.cats} onChange={v => {
          const has = p.cats.includes(v)
          if (has && p.cats.length === 1) return
          set({ cats: has ? p.cats.filter(c => c !== v) : [...p.cats, v] })
        }} options={TABS.map(t => ({ v: t.key, label: t.title }))} />

        <h4>Words per round <span className="cnt">{count}</span></h4>
        <input className="range" type="range" min={1} max={50} value={Math.min(p.count, 50)} onChange={e => set({ count: Number(e.target.value) })} aria-label="Words per round" />
        <div className="range-ends"><span>1</span><span>{pool < 50 ? `${pool} available` : '50'}</span></div>

        <button className="start" type="button" disabled={pool === 0} onClick={() => {
          try { localStorage.setItem(PREFS[game], JSON.stringify({ ...p, source })) } catch { /* */ }
          onStart({ game, mode: p.mode, source, cats: p.cats, count, cards: p.cards, key: Date.now() })
        }}>Start</button>
      </div>
    </div>
  )
}

export default function Play({ onHome, onStart, onStartSentences }: { onHome: () => void; onStart: (s: GameSetup) => void; onStartSentences: (s: SentenceSetup) => void }) {
  const [setup, setSetup] = useState<Game | null>(null)
  const [ssetup, setSSetup] = useState(false)
  return (
    <div className="wrap play" data-tab="nouns">
      <div className="topnav"><button className="homebtn" type="button" onClick={onHome}>‹ Home</button></div>
      <PageTitle tab="nouns" title="Play" hi="खेल" />
      <div className="games">
        <button className="game-card" type="button" onClick={() => setSetup('words')} style={{ ['--k' as string]: '#be4a64' }}>
          <Svg html={ORN.bullet.verbs} />
          <span className="gc-text"><span className="gc-t">Words</span><span className="gc-d">Translate single words, English ⇄ Hindi</span></span>
          <span className="chev" aria-hidden="true" />
        </button>
        <button className="game-card" type="button" onClick={() => setSetup('match')} style={{ ['--k' as string]: '#c35f3f' }}>
          <Svg html={ORN.bullet.adjectives} />
          <span className="gc-text"><span className="gc-t">Recognition</span><span className="gc-d">Pick the right translation out of six</span></span>
          <span className="chev" aria-hidden="true" />
        </button>
        <button className="game-card" type="button" onClick={() => setSSetup(true)} style={{ ['--k' as string]: '#8e4585' }}>
          <Svg html={ORN.bullet.nouns} />
          <span className="gc-text"><span className="gc-t">Sentences</span><span className="gc-d">Translate whole sentences · Easy, Medium, Hard</span></span>
          <span className="chev" aria-hidden="true" />
        </button>
        <p className="soon">More games coming soon.</p>
      </div>
      {setup && <Setup game={setup} onCancel={() => setSetup(null)} onStart={s => { setSetup(null); onStart(s) }} />}
      {ssetup && <SentenceSetupSheet onCancel={() => setSSetup(false)} onStart={s => { setSSetup(false); onStartSentences(s) }} />}
    </div>
  )
}
