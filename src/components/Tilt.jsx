import { useRef } from 'react'

/** Card com inclinação 3D que segue o mouse. */
export default function Tilt({ as: Tag = 'div', max = 10, className = '', children, ...props }) {
  const ref = useRef()
  const onMove = (e) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${-py * max}deg`)
    el.style.setProperty('--ry', `${px * max}deg`)
    el.style.setProperty('--gx', `${(px + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }
  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...props}>
      {children}
    </Tag>
  )
}
