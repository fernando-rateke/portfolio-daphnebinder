import { about } from '../data.js'

export default function About() {
  return (
    <section className="about section dark" id="sobre">
      <div className="wrap">
        <p className="eyebrow" data-reveal>Sobre</p>
        <h2 className="about__lead" data-split>
          {about.lead} {about.text}
        </h2>
        <div className="about__grid">
          {about.stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <strong data-count={s.value} data-plain={s.plain ? '1' : undefined} data-suffix={s.suffix || ''}>
                {s.value}
                {s.suffix}
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <ul className="chips" data-reveal>
          {about.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="about__note" data-reveal>
          {about.note}
        </p>
      </div>
    </section>
  )
}
