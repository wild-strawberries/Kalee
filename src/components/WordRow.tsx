import type { Word, TabKey } from '../types'
import { CATEGORY } from '../data'

/** English with any "(…)" part shown in muted italics. */
export function English({ text }: { text: string }) {
  const parts = text.split(/(\([^)]*\))/)
  return <>{parts.map((p, i) => p.startsWith('(') ? <span key={i} className="q">{p}</span> : p)}</>
}

export function Romanized({ w }: { w: Word }) {
  if (!w.pl) return <>{w.ro}</>
  if (w.pl[0] === w.ro) return <>{w.ro} <span className="gl">(s./pl.)</span></>
  return <>{w.ro} <span className="gl">(s.)</span> / {w.pl[0]} <span className="gl">(pl.)</span></>
}
export const devanagari = (w: Word) => (w.pl && w.pl[0] !== w.ro ? `${w.dv} / ${w.pl[1]}` : w.dv)

export default function WordRow({ w, tab, showCat }: { w: Word; tab: TabKey; showCat?: boolean }) {
  return (
    <li className={`r${w.top ? ' top' : ''}`}>
      <span className="en">
        {tab === 'verbs' && <><i>to</i>{' '}</>}
        <English text={w.en} />
        {w.tag && <> <span className={`tag t-${w.tag}`}>{w.tag}</span></>}
        {showCat && <span className="cat" style={{ display: 'inline' }}>{CATEGORY[tab]}</span>}
        {w.note && <small className="note">{w.note}</small>}
      </span>
      <span className="ro"><Romanized w={w} /></span>
      <span className="dv" lang="hi">{devanagari(w)}</span>
    </li>
  )
}
