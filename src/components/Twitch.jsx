import { lazy, useRef, useState } from 'react'
import LazyCanvas from './LazyCanvas.jsx'
import TitleCard from './TitleCard.jsx'
import { useLightbox } from './Lightbox.jsx'
import { twitch, contact } from '../data.js'

const CarouselScene = lazy(() => import('../three/CarouselScene.jsx'))

export default function Twitch() {
  const open = useLightbox()
  const drag = useRef({ target: 0, dragging: false, moved: 0, x: 0 })
  const [idx, setIdx] = useState(0)
  const step = (Math.PI * 2) / twitch.items.length
  const images = twitch.items.map((i) => ({ src: i.src, title: `Twitch Graphics — ${i.title}` }))

  const down = (e) => {
    const d = drag.current
    d.dragging = true
    d.moved = 0
    d.x = e.clientX
  }
  const move = (e) => {
    const d = drag.current
    if (!d.dragging) return
    const dx = e.clientX - d.x
    d.x = e.clientX
    d.moved += Math.abs(dx)
    d.target += dx * 0.0055
  }
  const up = () => {
    const d = drag.current
    d.dragging = false
    d.target = Math.round(d.target / step) * step // encaixa no board mais próximo
  }
  const nudge = (dir) => {
    const d = drag.current
    d.target = (Math.round(d.target / step) - dir) * step
  }

  return (
    <section className="twitch" id="trabalhos">
      <TitleCard index="01" title={twitch.title} years={twitch.years} />
      <div className="twitch__stage dark">
        <div className="wrap twitch__head">
          <p className="twitch__text" data-reveal>{twitch.text}</p>
          <p className="twitch__count" data-reveal>
            <strong>50+</strong> clientes desde 2015
          </p>
        </div>
        <div
          className="twitch__carousel"
          data-cursor="arraste"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
        >
          <LazyCanvas className="twitch__canvas" camera={{ position: [0, 0.6, 11.2], fov: 32 }}>
            <CarouselScene items={twitch.items} drag={drag} onOpen={(i) => open(images, i)} onIndex={setIdx} />
          </LazyCanvas>
        </div>
        <div className="wrap twitch__controls">
          <button className="round" aria-label="Board anterior" onClick={() => nudge(-1)}>←</button>
          <div className="twitch__label" aria-live="polite">
            <span>{String(idx + 1).padStart(2, '0')} / {String(twitch.items.length).padStart(2, '0')}</span>
            <strong>{twitch.items[idx].title}</strong>
          </div>
          <button className="round" aria-label="Próximo board" onClick={() => nudge(1)}>→</button>
        </div>
        <p className="wrap twitch__more" data-reveal>
          Mais trabalhos em{' '}
          <a href={contact.behance} target="_blank" rel="noreferrer">behance.net/daphnebinder</a>
        </p>
      </div>
    </section>
  )
}
