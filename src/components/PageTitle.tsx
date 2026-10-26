import { ORN } from '../data'
import type { TabKey } from '../types'
import Svg from './Svg'

export default function PageTitle({ tab, title, hi }: { tab: TabKey; title: string; hi: string }) {
  return (
    <div className="ptitle" data-tab={tab}>
      <Svg className="sideL" html={ORN.side[tab]} />
      <div className="pt-text"><h2>{title.toUpperCase()}</h2><p lang="hi">{hi}</p></div>
      <Svg className="sideR" html={ORN.sideR[tab]} />
    </div>
  )
}
