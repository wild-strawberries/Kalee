import { ORN } from '../data'
import Svg from './Svg'

export default function Home({ onGo }: { onGo: (r: 'study' | 'play' | 'cards') => void }) {
  return (
    <div className="screen home">
      <div className="home-in">
        <Svg html={ORN.header} />
        <h1>KALEE</h1>
        <p className="hhi" lang="hi">कली</p>
        <div className="choices">
          <button className="choice" style={{ ['--k' as string]: '#c35f3f' }} onClick={() => onGo('cards')}>
            <span className="c-en">LEARN</span><span className="c-hi" lang="hi">सीखें</span>
          </button>
          <button className="choice" style={{ ['--k' as string]: '#8e4585' }} onClick={() => onGo('play')}>
            <span className="c-en">PLAY</span><span className="c-hi" lang="hi">खेल</span>
          </button>
        </div>
        <Svg html={ORN.footer} />
        <button className="library" type="button" onClick={() => onGo('study')} aria-label="Word library" title="Word library">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 6.5 C 10 5, 6.5 4.6, 3.5 5.2 V 18.4 C 6.5 17.8, 10 18.2, 12 19.6 C 14 18.2, 17.5 17.8, 20.5 18.4 V 5.2 C 17.5 4.6, 14 5, 12 6.5 Z" />
            <path d="M12 6.5 V 19.6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
