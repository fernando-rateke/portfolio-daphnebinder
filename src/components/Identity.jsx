import TitleCard from './TitleCard.jsx'
import Tilt from './Tilt.jsx'
import { identity } from '../data.js'

export default function Identity() {
  return (
    <section className="identity">
      <TitleCard index="02" title={identity.title} />
      <div className="dark section">
        <div className="wrap identity__grid">
          {identity.items.map((p) => (
            <Tilt key={p.name} className="idcard" max={8} style={{ '--accent': p.accent }} data-reveal>
              <div className="idcard__logo">
                <img src={p.logo} alt={`Logo ${p.name}`} loading="lazy" />
              </div>
              <div className="idcard__body">
                <h3>
                  {p.name} <span>({p.year})</span>
                </h3>
                {p.text.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                <ul className="tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="idcard__shine" />
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  )
}
