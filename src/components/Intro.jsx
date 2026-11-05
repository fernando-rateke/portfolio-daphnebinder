import { useEffect, useRef, useState } from 'react'
// importados pelo Vite: o nome final leva um hash do conteúdo, então um vídeo
// novo sempre vira uma URL nova (nada de versão antiga presa no cache)
import intro720 from '../assets/intro/intro-720.mp4'
import intro1080 from '../assets/intro/intro-1080.mp4'
import vertical720 from '../assets/intro/intro-vertical-720.mp4'
import vertical1080 from '../assets/intro/intro-vertical-1080.mp4'
import poster from '../assets/intro/poster.jpg'
import posterVertical from '../assets/intro/poster-vertical.jpg'

/**
 * Vídeo de introdução (renderizado a partir da cena 3D em src/film).
 * Toca uma vez por sessão; pode ser pulado; respeita "reduzir movimento".
 */
export default function Intro({ onDone }) {
  const video = useRef()
  const [leaving, setLeaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    setLeaving(true)
    try {
      sessionStorage.setItem('intro-seen', '1')
    } catch {}
    setTimeout(onDone, 900)
  }

  useEffect(() => {
    const v = video.current
    if (!v) return
    // se o autoplay falhar (ou o vídeo não carregar), segue para o site
    const failSafe = setTimeout(() => v.currentTime === 0 && finish(), 4000)
    v.play().catch(() => finish())
    const key = (e) => (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && finish()
    window.addEventListener('keydown', key)
    return () => {
      clearTimeout(failSafe)
      window.removeEventListener('keydown', key)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // vídeo vertical em telas em pé (celular), horizontal no resto
  const portrait = window.innerHeight > window.innerWidth
  const px = Math.max(window.innerWidth, window.innerHeight) * (window.devicePixelRatio || 1)
  const hd = px > 1500
  const src = portrait ? (hd ? vertical1080 : vertical720) : hd ? intro1080 : intro720

  return (
    <div className={`intro${leaving ? ' intro--leave' : ''}`}>
      <video
        ref={video}
        className="intro__video"
        muted
        playsInline
        preload="auto"
        poster={portrait ? posterVertical : poster}
        onEnded={finish}
        onError={finish}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button className="intro__skip" onClick={finish}>
        Pular intro <span aria-hidden="true">→</span>
      </button>
      <div className="intro__bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
