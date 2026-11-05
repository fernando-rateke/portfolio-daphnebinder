import { useEffect, useRef, useState } from 'react'

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
  const src = portrait
    ? `/intro/intro-vertical-${hd ? 1080 : 720}.mp4`
    : `/intro/intro-${hd ? 1080 : 720}.mp4`

  return (
    <div className={`intro${leaving ? ' intro--leave' : ''}`}>
      <video
        ref={video}
        className="intro__video"
        muted
        playsInline
        preload="auto"
        poster={portrait ? '/intro/poster-vertical.jpg' : '/intro/poster.jpg'}
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
