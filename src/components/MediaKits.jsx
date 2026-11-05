import TitleCard from './TitleCard.jsx'
import Tilt from './Tilt.jsx'
import { useLightbox } from './Lightbox.jsx'
import { mediaKits } from '../data.js'

export default function MediaKits() {
  const open = useLightbox()
  return (
    <section className="kits">
      <TitleCard index="03" title={mediaKits.title} />
      <div className="kits__pin dark">
        <div className="wrap kits__head">
          <p data-reveal>{mediaKits.text}</p>
          <span className="kits__hint" aria-hidden="true">role →</span>
        </div>
        <div className="kits__viewport">
          <div className="kits__track">
            {mediaKits.items.map((k, i) => (
              <Tilt
                as="button"
                key={k.name}
                className="kit"
                max={12}
                data-cursor="abrir"
                onClick={() => open(k.images.map((src, j) => ({ src, title: `Mídia kit — ${k.name}` })), 0)}
                aria-label={`Abrir mídia kit ${k.name}`}
              >
                <div className="kit__img">
                  <img src={k.images[0]} alt="" loading="lazy" />
                  {k.images.length > 1 && <span className="kit__more">+{k.images.length - 1}</span>}
                </div>
                <div className="kit__meta">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <strong>{k.name}</strong>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
