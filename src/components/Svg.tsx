/** Renders one of the pre-drawn floral SVG ornaments. */
export default function Svg({ html, className }: { html: string; className?: string }) {
  return <span className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
}
