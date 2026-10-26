import { ORN } from '../data'
import Svg from './Svg'

export default function Home({ onGo }: { onGo: (r: 'study' | 'play') => void }) {
  return (
    <div className="screen home">
      <div className="home-in">
        <Svg html={ORN.header} />
        <h1>KALEE</h1>
        <p className="hhi" lang="hi">कली</p>
        <div className="choices">
          <button className="choice" style={{ ['--k' as string]: '#be4a64' }} onClick={() => onGo('study')}>
            <span className="c-en">STUDY</span><span className="c-hi" lang="hi">पढ़ाई</span>
          </button>
          <button className="choice" style={{ ['--k' as string]: '#8e4585' }} onClick={() => onGo('play')}>
            <span className="c-en">PLAY</span><span className="c-hi" lang="hi">खेल</span>
          </button>
        </div>
        <Svg html={ORN.footer} />
      </div>
    </div>
  )
}
