import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

export const BADGE_TEXT = 'GRAPHICS BY DAPHNE BINDER • SINCE 2015 • '
export const SERVICES_TEXT = 'TWITCH GRAPHICS • IDENTIDADE VISUAL • MÍDIA KITS • SOCIAL MEDIA • UI/UX • '

/** Luz de estúdio sem baixar HDR (tudo local). */
export function StudioLights({ intensity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.55 * intensity} />
      <directionalLight position={[3, 5, 4]} intensity={1.6 * intensity} color="#fff4fd" />
      <directionalLight position={[-4, 2, -3]} intensity={1.2 * intensity} color="#f3a6ec" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 4]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} scale={[3, 6, 1]} color="#f3cef0" />
        <Lightformer form="ring" intensity={2} position={[5, 2, -2]} scale={3} color="#e9a8e3" />
        <Lightformer form="rect" intensity={0.6} position={[0, -4, 2]} scale={[8, 2, 1]} color="#b57bee" />
      </Environment>
    </>
  )
}

/** Textura com o texto do selo, desenhada num canvas (usa a fonte Baloo 2 já carregada). */
export function useBadgeTexture({ color = '#1a1a1a', text = BADGE_TEXT, repeat = 2 } = {}) {
  text ??= BADGE_TEXT
  repeat ??= 2
  const [ready, setReady] = useState(false)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4096
    c.height = 192
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.wrapS = THREE.RepeatWrapping
    return t
  }, [])
  useEffect(() => {
    let alive = true
    const draw = () => {
      if (!alive) return
      const c = tex.image
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.fillStyle = color
      ctx.textBaseline = 'middle'
      const full = text.repeat(repeat)
      let size = 130
      ctx.font = `800 ${size}px "Baloo 2", system-ui, sans-serif`
      const wdt = ctx.measureText(full).width
      // estica para preencher a volta inteira
      ctx.save()
      ctx.scale(c.width / wdt, 1)
      ctx.fillText(full, 0, c.height / 2 + 10)
      ctx.restore()
      tex.needsUpdate = true
      setReady(true)
    }
    if (document.fonts?.load) document.fonts.load('800 130px "Baloo 2"').then(draw, draw)
    else draw()
    return () => {
      alive = false
    }
  }, [tex, color, text, repeat])
  return { tex, ready }
}

/** Anel 3D com o texto do selo girando em volta do mascote. */
export function RingBand({ radius = 2.4, height = 0.36, color = '#1a1a1a', speed = 0.25, text, repeat, getT, getOpacity, ...props }) {
  const { tex } = useBadgeTexture({ color, text, repeat })
  const ref = useRef()
  const front = useRef()
  const back = useRef()
  useFrame((state, dt) => {
    if (!ref.current) return
    if (getT) ref.current.rotation.y = -getT(state) * speed
    else ref.current.rotation.y -= dt * speed
    if (getOpacity && front.current) {
      const o = getOpacity(state)
      front.current.opacity = o
      back.current.opacity = o * 0.28
    }
  })
  return (
    <group {...props}>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[radius, radius, height, 128, 1, true]} />
          <meshBasicMaterial ref={front} map={tex} transparent side={THREE.FrontSide} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius, radius, height, 128, 1, true]} />
          <meshBasicMaterial ref={back} map={tex} transparent opacity={0.28} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** Plano curvado (como um pedaço de cilindro). */
export function bentPlane(width, height, radius, segments = 32) {
  const g = new THREE.PlaneGeometry(width, height, segments, 1)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const a = x / radius
    p.setX(i, Math.sin(a) * radius)
    p.setZ(i, Math.cos(a) * radius - radius)
  }
  g.computeVertexNormals()
  return g
}

/** Retângulo com cantos arredondados e UV normalizado (para telas de celular). */
export function roundedRectGeometry(w, h, r, seg = 8) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  const g = new THREE.ShapeGeometry(s, seg)
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x) / w, (p.getY(i) - y) / h)
  uv.needsUpdate = true
  return g
}

/** Ajusta texturas carregadas (sRGB + anisotropia). */
export function prepTextures(list, gl) {
  const arr = Array.isArray(list) ? list : [list]
  arr.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = gl?.capabilities?.getMaxAnisotropy?.() ?? 4
    t.needsUpdate = true
  })
  return list
}
