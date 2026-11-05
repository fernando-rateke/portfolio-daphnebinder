import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { bentPlane, prepTextures } from './shared.jsx'

const RADIUS = 5.4

function Board({ tex, angle, index, onOpen, drag }) {
  const img = tex.image
  const w = 2.9
  const h = Math.min(3.05, w * (img.height / img.width))
  const geo = useMemo(() => bentPlane(w, h, RADIUS, 40), [w, h])
  const ref = useRef()
  const [hover, setHover] = useState(false)
  useFrame((_, dt) => {
    if (!ref.current) return
    const s = hover ? 1.06 : 1
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), Math.min(1, dt * 8))
  })
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={ref} position={[0, 0, RADIUS]}>
        <mesh
          geometry={geo}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHover(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHover(false)
            document.body.style.cursor = ''
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (drag.current.moved < 6) onOpen(index)
          }}
        >
          <meshBasicMaterial map={tex} side={THREE.FrontSide} toneMapped={false} />
        </mesh>
        {/* reflexo no chão */}
        <mesh geometry={geo} position={[0, -h - 0.08, 0]} scale={[1, -1, 1]}>
          <meshBasicMaterial map={tex} transparent opacity={0.1} side={THREE.FrontSide} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Carrossel 3D com os boards de Twitch.
 * `drag` é um ref compartilhado com o container DOM: { target, moved }.
 */
export default function CarouselScene({ items, drag, onOpen, onIndex }) {
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const tex = useTexture(items.map((i) => i.src))
  prepTextures(tex, gl)
  const group = useRef()
  const cur = useRef(0)
  const last = useRef(-1)
  const step = (Math.PI * 2) / items.length
  const mobile = size.width < 700

  useFrame((state, dt) => {
    const d = drag.current
    if (!d.dragging) d.target -= dt * 0.12 // auto-rotação lenta
    cur.current += (d.target - cur.current) * Math.min(1, dt * 5)
    if (group.current) {
      group.current.rotation.y = cur.current
      group.current.rotation.x = 0.06 + state.pointer.y * 0.04
    }
    // índice do board de frente
    const idx = ((Math.round(-cur.current / step) % items.length) + items.length) % items.length
    if (idx !== last.current) {
      last.current = idx
      onIndex?.(idx)
    }
    state.camera.position.z = mobile ? 17 : 12.6
    state.camera.lookAt(0, 0.2, 0)
  })

  return (
    <group ref={group} position={[0, 0.35, 0]}>
      {items.map((it, i) => (
        <Board key={it.src} tex={tex[i]} angle={i * step} index={i} onOpen={onOpen} drag={drag} />
      ))}
    </group>
  )
}
