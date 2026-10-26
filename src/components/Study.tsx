import { useMemo, useState } from 'react'
import { ORN, TABS } from '../data'
import type { TabKey } from '../types'
import PageTitle from './PageTitle'
import SentenceModal from './SentenceModal'
import Svg from './Svg'
import WordRow from './WordRow'

const TAB_KEY = 'hv-tab'
const readTab = (): TabKey => {
  try { const t = localStorage.getItem(TAB_KEY) as TabKey; if (TABS.some(x => x.key === t)) return t } catch { /* */ }
  return 'nouns'
}
const hay = (w: { en: string; ro: string; dv: string; note?: string; pl?: [string, string] }) =>
  [w.en, w.ro, w.dv, w.note || '', w.pl ? w.pl.join(' ') : ''].join(' ').toLowerCase().normalize('NFC')

export default function Study({ onHome }: { onHome: () => void }) {
  const [tab, setTab] = useState<TabKey>(readTab)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {}
    TABS.forEach(t => t.sections.forEach(s => { o[`${t.key}/${s.name}`] = !!s.open }))
    return o
  })
  const [onlyTop, setOnlyTop] = useState<Record<string, boolean>>({})
  const [modal, setModal] = useState(false)

  const pick = (k: TabKey) => { setQ(''); setTab(k); try { localStorage.setItem(TAB_KEY, k) } catch { /* */ } window.scrollTo(0, 0) }
  const v = q.trim().toLowerCase().normalize('NFC')
  const searching = v.length > 0

  const results = useMemo(() => {
    if (!searching) return null
    return TABS.map(t => ({
      t, sections: t.sections.map(s => ({ s, items: s.items.filter(w => hay(w).includes(v)) })).filter(x => x.items.length)
    })).filter(x => x.sections.length)
  }, [v, searching])

  const current = TABS.find(t => t.key === tab)!

  return (
    <div className="wrap" data-tab={tab}>
      <div className="bar">
        <div className="topnav">
          <button className="homebtn" type="button" onClick={onHome}>‹ Home</button>
          <nav className="tabs" role="tablist" aria-label="Word types">
            {TABS.map(t => (
              <button key={t.key} className="tab" role="tab" data-tab={t.key} aria-selected={!searching && t.key === tab} onClick={() => pick(t.key)}>{t.title}</button>
            ))}
          </nav>
        </div>
        <div className="search">
          <svg className="orn" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="M11 11 L14.5 14.5" /></svg>
          <label htmlFor="q" className="sr">Search all words</label>
          <input id="q" type="search" placeholder="Search English, romanized or हिंदी" autoComplete="off" autoCapitalize="off" spellCheck={false}
            value={q} onChange={e => setQ(e.target.value)} />
          {searching && <button id="clear" type="button" onClick={() => setQ('')}>Clear</button>}
        </div>
      </div>

      {results ? (
        <main>
          {results.map(({ t, sections }) => (
            <section className="panel" data-tab={t.key} key={t.key}>
              {sections.map(({ s, items }) => (
                <details className="sec" open key={s.name}>
                  <summary><Svg html={ORN.bullet[t.key]} /><h3>{s.name}</h3><span className="chev" aria-hidden="true" /></summary>
                  <ul>{items.map(w => <WordRow key={w.id + s.name} w={w} tab={t.key} showCat />)}</ul>
                </details>
              ))}
            </section>
          ))}
          {results.length === 0 && <p className="empty">No words match that search.</p>}
        </main>
      ) : (
        <main>
          <section className={`panel${onlyTop[tab] ? ' only-top' : ''}`} data-tab={tab}>
            <PageTitle tab={tab} title={current.title} hi={current.hi} />
            <div className="tools">
              <div className="btns">
                <button className="only" type="button" aria-pressed={!!onlyTop[tab]} onClick={() => {
                  const on = !onlyTop[tab]
                  setOnlyTop({ ...onlyTop, [tab]: on })
                  if (on) { const o = { ...open }; current.sections.forEach(s => { o[`${tab}/${s.name}`] = true }); setOpen(o) }
                }}>Most common only</button>
                <button className="toggle" type="button" onClick={() => {
                  const all = current.sections.every(s => open[`${tab}/${s.name}`])
                  const o = { ...open }; current.sections.forEach(s => { o[`${tab}/${s.name}`] = !all }); setOpen(o)
                }}>{current.sections.every(s => open[`${tab}/${s.name}`]) ? 'Close all' : 'Open all'}</button>
              </div>
              <button className="sbtn" type="button" aria-label="Sentence structure" aria-haspopup="dialog" onClick={() => setModal(true)}>S</button>
            </div>
            {current.sections.map(s => {
              const k = `${tab}/${s.name}`
              const hasTop = s.items.some(w => w.top)
              return (
                <details key={k} className={`sec${hasTop ? '' : ' no-top'}`} open={!!open[k]}
                  onToggle={e => { const o = (e.currentTarget as HTMLDetailsElement).open; if (o !== !!open[k]) setOpen(p => ({ ...p, [k]: o })) }}>
                  <summary><Svg html={ORN.bullet[tab]} /><h3>{s.name}{s.sub && <> <span className="sub">{s.sub}</span></>}</h3><span className="chev" aria-hidden="true" /></summary>
                  <ul>{s.items.map(w => <WordRow key={w.id} w={w} tab={tab} />)}</ul>
                </details>
              )
            })}
            <p className="count">{current.count} {current.title.toLowerCase()}</p>
          </section>
        </main>
      )}
      <footer><Svg html={ORN.footer} /></footer>
      {modal && <SentenceModal onClose={() => setModal(false)} />}
    </div>
  )
}
