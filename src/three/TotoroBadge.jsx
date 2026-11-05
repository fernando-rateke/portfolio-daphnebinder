import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BADGE_TEXT } from './shared.jsx'

// Selo da Daphne em 3D: o Totoro da capa do portfólio original no centro,
// texto circular em volta, como uma medalha/sticker com borda arredondada.

const loadImg = (src) =>
  new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })

let assets
function loadAssets() {
  assets ??= Promise.all([
    loadImg('/brand/totoro-shape.png'),
    loadImg('/brand/totoro-detail.png'),
    document.fonts?.load ? document.fonts.load('800 60px "Baloo 2"').catch(() => {}) : null,
  ])
  return assets
}

/** Desenha um Totoro (duas camadas recoloridas) num canvas. */
export function drawTotoro(ctx, shape, detail, x, y, h, belly, body) {
  const w = h * (shape.width / shape.height)
  const tmp = document.createElement('canvas')
  tmp.width = Math.ceil(w)
  tmp.height = Math.ceil(h)
  const t = tmp.getContext('2d')
  for (const [img, color] of [
    [shape, belly],
    [detail, body],
  ]) {
    t.clearRect(0, 0, tmp.width, tmp.height)
    t.globalCompositeOperation = 'source-over'
    t.drawImage(img, 0, 0, w, h)
    t.globalCompositeOperation = 'source-in'
    t.fillStyle = color
    t.fillRect(0, 0, tmp.width, tmp.height)
    ctx.drawImage(tmp, x - w / 2, y - h / 2)
  }
}

function drawCircleText(ctx, text, cx, cy, r, size, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `800 ${size}px "Baloo 2", system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0)
  const scale = (Math.PI * 2 * r) / total // espaçamento para fechar a volta
  let a = -Math.PI / 2
  chars.forEach((c, i) => {
    const step = (widths[i] * scale) / r
    a += step / 2
    ctx.save()
    ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(c, 0, 0)
    ctx.restore()
    a += step / 2
  })
  ctx.restore()
}

function makeFace({ bg, text, belly, body, ring }, [shape, detail]) {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, S, S)
  // aro interno
  ctx.strokeStyle = ring
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2)
  ctx.stroke()
  drawCircleText(ctx, BADGE_TEXT, S / 2, S / 2, S * 0.42, 62, text)
  drawTotoro(ctx, shape, detail, S / 2, S / 2 + 6, S * 0.5, belly, body)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const FRONT = { bg: '#1f1e24', text: '#f3cef0', belly: '#f8dcf5', body: '#e9a8e3', ring: 'rgba(243,206,240,0.35)' }
const BACK = { bg: '#f3cef0', text: '#1a1a1a', belly: '#f8dcf5', body: '#1f1e24', ring: 'rgba(26,26,26,0.25)' }

/**
 * @param getT   opcional: (state) => tempo (render determinístico do filme)
 * @param follow inclina na direção do ponteiro
 * @param spin   faz um giro completo de tempos em tempos
 */
export default function TotoroBadge({ radius = 1.75, thickness = 0.24, getT, follow = true, spin = true, ...props }) {
  const tilt = useRef()
  const flip = useRef()
  const front = useRef()
  const back = useRef()

  const mats = useMemo(
    () => ({
      face: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 }),
      faceBack: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 }),
      rim: new THREE.MeshPhysicalMaterial({ color: '#f39be9', roughness: 0.22, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 }),
    }),
    [],
  )

  useEffect(() => {
    let alive = true
    loadAssets().then(([shape, detail]) => {
      if (!alive) return
      mats.face.map = makeFace(FRONT, [shape, detail])
      mats.faceBack.map = makeFace(BACK, [shape, detail])
      mats.face.needsUpdate = mats.faceBack.needsUpdate = true
      window.__badgeReady = true
    })
    return () => {
      alive = false
    }
  }, [mats])

  useFrame((state, dt) => {
    const t = getT ? getT(state) : state.clock.elapsedTime
    if (tilt.current) {
      const ty = follow ? state.pointer.x * 0.5 : Math.sin(t * 0.7) * 0.25
      const tx = follow ? -state.pointer.y * 0.3 : Math.sin(t * 0.9) * 0.08
      if (getT) tilt.current.rotation.set(tx, ty, 0)
      else {
        const k = Math.min(1, dt * 4)
        tilt.current.rotation.x += (tx - tilt.current.rotation.x) * k
        tilt.current.rotation.y += (ty - tilt.current.rotation.y) * k
      }
    }
    if (flip.current && spin) {
      // a cada 9s, um giro de 360° com easing
      const p = THREE.MathUtils.clamp(((t % 9) - 6.5) / 1.6, 0, 1)
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      flip.current.rotation.y = e * Math.PI * 2
    }
  })

  const h = thickness / 2
  return (
    <group {...props}>
      <group ref={tilt}>
        <group ref={flip}>
          <mesh ref={front} position={[0, 0, h]} material={mats.face}>
            <circleGeometry args={[radius, 96]} />
          </mesh>
          <mesh ref={back} position={[0, 0, -h]} rotation={[0, Math.PI, 0]} material={mats.faceBack}>
            <circleGeometry args={[radius, 96]} />
          </mesh>
          <mesh material={mats.rim}>
            <torusGeometry args={[radius, h, 24, 128]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
