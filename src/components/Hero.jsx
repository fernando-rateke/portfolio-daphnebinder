import { lazy } from 'react'
import LazyCanvas from './LazyCanvas.jsx'
import Badge from './Badge.jsx'
import Totoro from './Totoro.jsx'
import { scrollTo } from './Nav.jsx'

const HeroScene = lazy(() => import('../three/HeroScene.jsx'))

export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* selo gigante em tom sobre tom, como na capa do portfólio */}
      <Badge size="min(64vw, 780px)" className="hero__ghost" color="rgba(122, 63, 116, 0.075)">
        <Totoro body="rgba(122, 63, 116, 0.065)" className="hero__ghost-totoro" />
      </Badge>
      <LazyCanvas className="hero__canvas" camera={{ position: [0, 0, 9], fov: 35 }} shadows={false}>
        <HeroScene />
      </LazyCanvas>
      <div className="hero__content">
        <p className="eyebrow" data-hero>Portfólio · 2015 — {new Date().getFullYear()}</p>
        <h1 className="hero__title" data-hero>
          <span>Daphne</span>
          <span>Binder</span>
        </h1>
        <p className="hero__sub" data-hero>
          Designer gráfica e de interfaces. Twitch graphics, identidade visual, mídia kits, social media e UI/UX.
        </p>
        <div className="hero__actions" data-hero>
          <a href="#trabalhos" className="btn btn--dark" onClick={(e) => (e.preventDefault(), scrollTo('#trabalhos'))}>
            Ver trabalhos
          </a>
          <a href="#contato" className="btn btn--ghost" onClick={(e) => (e.preventDefault(), scrollTo('#contato'))}>
            Contato
          </a>
        </div>
      </div>
    </section>
  )
}
