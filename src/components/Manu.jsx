import TitleCard from './TitleCard.jsx'
import Tilt from './Tilt.jsx'
import { useLightbox } from './Lightbox.jsx'
import { manu } from '../data.js'

export default function Manu() {
  const open = useLightbox()
  return (
    <section className="manu">
      <TitleCard index="04" title={manu.title} years={manu.years} />
      <div className="dark section">
        <div className="wrap manu__grid">
          <Tilt
            as="button"
            className="manu__cover"
            max={6}
            data-cursor="abrir"
            onClick={() => open([{ src: manu.cover, title: 'Social media — Manu Vieira' }, { src: manu.logos, title: 'Projetos e identidades — Manu Vieira' }])}
            aria-label="Ampliar trabalho de social media para Manu Vieira"
          >
            <img src={manu.cover} alt="Colagem de posts de social media para Manu Vieira" loading="lazy" data-parallax />
          </Tilt>
          <div className="manu__text">
            <p className="eyebrow" data-reveal>{manu.role}</p>
            <p className="manu__intro" data-reveal>{manu.intro}</p>
            <ol className="manu__list">
              {manu.list.map((l, i) => (
                <li key={l} data-reveal>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {l}
                </li>
              ))}
            </ol>
            <img className="manu__logos" src={manu.logos} alt="Escola do Legislativo, Floripa 5G, Frente Parlamentar de Desenvolvimento Econômico" loading="lazy" data-reveal />
          </div>
        </div>
      </div>
    </section>
  )
}
