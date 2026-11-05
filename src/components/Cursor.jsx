import { useEffect, useRef } from 'react'

/** Cursor personalizado (apenas em dispositivos com mouse). */
export default function Cursor() {
  const dot = useRef()
  const ring = useRef()
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      const t = e.target.closest?.('a, button, [data-cursor]')
      ring.current?.classList.toggle('is-hover', !!t)
      const label = t?.getAttribute?.('data-cursor') || ''
      if (ring.current) ring.current.dataset.label = label
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
