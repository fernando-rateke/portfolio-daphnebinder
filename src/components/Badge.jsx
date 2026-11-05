import { useId } from 'react'

/** Selo circular "GRAPHICS BY DAPHNE BINDER • SINCE 2015" (vetor, gira via CSS). */
export default function Badge({ size = 140, className = '', color = 'currentColor', children }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`badge ${className}`} style={{ width: size, height: size, color }} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="badge__ring">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text fill={color} fontSize="17.5" fontWeight="800" letterSpacing="3.2">
          <textPath href={`#${id}`} textLength="486" lengthAdjust="spacing">GRAPHICS BY DAPHNE BINDER • SINCE 2015 •</textPath>
        </text>
      </svg>
      <div className="badge__center">{children}</div>
    </div>
  )
}
