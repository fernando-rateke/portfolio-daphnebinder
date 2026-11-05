import { lazy, useState } from 'react'
import { useTexture } from '@react-three/drei'
import LazyCanvas from './LazyCanvas.jsx'
import TitleCard from './TitleCard.jsx'
import Tilt from './Tilt.jsx'
import { useLightbox } from './Lightbox.jsx'
import { uiux } from '../data.js'

const PhonesScene = lazy(() => import('../three/PhonesScene.jsx'))

export default function UIUX() {
  const open = useLightbox()
  const [active, setActive] = useState(uiux.projects[0].id)
  const p = uiux.projects.find((x) => x.id === active)

  // pré-carrega as telas dos outros projetos
  uiux.projects.forEach((x) => x.screens && useTexture.preload(x.screens))

  const gallery = p.screens
    ? p.screens.map((src) => ({ src, title: `${p.name} — ${p.kind}` }))
    : [{ src: p.image, title: `${p.name} — ${p.kind}` }]

  return (
    <section className="uiux" id="uiux">
      <TitleCard index="05" title={uiux.title} years={uiux.years} />
      <div className="uiux__stage section">
        <div className="wrap uiux__grid">
          <div className="uiux__text">
            <p className="uiux__intro" data-reveal>{uiux.intro}</p>
            <div className="tabs" role="tablist" aria-label="Projetos de UI/UX" data-reveal>
              {uiux.projects.map((x) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={x.id === active}
                  className={x.id === active ? 'is-active' : ''}
                  onClick={() => setActive(x.id)}
                >
                  {x.name}
                </button>
              ))}
            </div>
            <div className="uiux__project" key={p.id}>
              <span className="uiux__kind">{p.kind}</span>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
              <button className="btn btn--dark" onClick={() => open(gallery, 0)}>
                Ver telas
              </button>
            </div>
          </div>
          <div className="uiux__visual">
            {p.screens ? (
              <LazyCanvas className="uiux__canvas" camera={{ position: [0, 0, 5.6], fov: 40 }}>
                <PhonesScene screens={p.screens} projectId={p.id} onOpen={(i) => open(gallery, i)} />
              </LazyCanvas>
            ) : (
              <Tilt as="button" className="uiux__image" max={8} onClick={() => open(gallery, 0)} data-cursor="abrir" aria-label={`Ampliar ${p.name}`}>
                <img src={p.image} alt={`Telas do ${p.name}: app mobile e dashboard web`} />
              </Tilt>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
