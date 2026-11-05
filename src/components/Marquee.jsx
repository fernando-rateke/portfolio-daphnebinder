export default function Marquee({ items, tone = 'pink', reverse = false }) {
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className={`marquee marquee--${tone}${reverse ? ' marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}
