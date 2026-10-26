import { useEffect, useRef } from 'react'
import { SENTENCE } from '../data'

export default function SentenceModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', key); prev?.focus() }
  }, [onClose])
  const C = SENTENCE.colors
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ss-t" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <button className="x" type="button" ref={closeRef} onClick={onClose}>Close</button>
        <h2 id="ss-t">Sentence structure</h2>
        <div className="ex">
          <p className="ex-ro">{SENTENCE.example.map((w, i) => <span key={i} style={{ ['--k' as string]: C[w.part] }}>{w.ro}{' '}</span>)}</p>
          <p className="ex-dv" lang="hi">{SENTENCE.example.map((w, i) => <span key={i} style={{ ['--k' as string]: C[w.part] }}>{w.dv}{' '}</span>)}</p>
          <p className="ex-en">{SENTENCE.exampleEn}</p>
        </div>
        <ol className="ss">
          {SENTENCE.parts.map((p, i) => (
            <li key={p.name}>
              <div className="ss-h">
                <span className="ss-n" style={{ ['--k' as string]: C[i] }}>{i + 1}</span>
                <span className="ss-c">{p.name}</span><span className="ss-hi">{p.hindi}</span>
              </div>
              <div className="ss-ex">
                {p.examples.map(e => <span className="ss-w" key={e.ro}><b>{e.ro}</b> <span lang="hi">{e.dv}</span> <i>{e.en}</i></span>)}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
