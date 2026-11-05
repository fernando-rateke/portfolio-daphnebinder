import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Mascote original da marca: um gatinho ("koneko") estilo vinyl toy,
// nas cores da Daphne (grafite + rosa).
const C = {
  fur: '#2b2a30',
  cream: '#fbeaf8',
  pink: '#f3a6ec',
  blush: '#ff8fd8',
  eye: '#0d0c10',
  pencil: '#f3cef0',
  wood: '#f1c99b',
}

function useMaterials() {
  return useMemo(
    () => ({
      fur: new THREE.MeshPhysicalMaterial({ color: C.fur, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color('#f3cef0'), sheenRoughness: 0.6 }),
      cream: new THREE.MeshPhysicalMaterial({ color: C.cream, roughness: 0.5, clearcoat: 0.2 }),
      pink: new THREE.MeshPhysicalMaterial({ color: C.pink, roughness: 0.45, clearcoat: 0.3 }),
      blush: new THREE.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.55, depthWrite: false }),
      eye: new THREE.MeshPhysicalMaterial({ color: C.eye, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
      white: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      line: new THREE.MeshBasicMaterial({ color: '#f7d9f4' }),
      mouth: new THREE.MeshBasicMaterial({ color: '#141317' }),
      pencil: new THREE.MeshPhysicalMaterial({ color: C.pencil, roughness: 0.35, clearcoat: 0.6 }),
      wood: new THREE.MeshStandardMaterial({ color: C.wood, roughness: 0.8 }),
      graphite: new THREE.MeshStandardMaterial({ color: '#2b2a30', roughness: 0.4 }),
    }),
    [],
  )
}

function Tail({ m }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.35, -1.55, -0.55),
      new THREE.Vector3(1.05, -1.5, -0.55),
      new THREE.Vector3(1.45, -1.0, -0.35),
      new THREE.Vector3(1.4, -0.35, -0.2),
      new THREE.Vector3(1.12, -0.12, -0.12),
    ])
    return new THREE.TubeGeometry(curve, 64, 0.14, 16, false)
  }, [])
  return (
    <group>
      <mesh geometry={geo} material={m.fur} castShadow />
      <mesh position={[1.12, -0.12, -0.12]} material={m.fur}>
        <sphereGeometry args={[0.14, 24, 24]} />
      </mesh>
    </group>
  )
}

function Whiskers({ side, m }) {
  return (
    <group position={[side * 0.78, -0.2, 0.62]} rotation={[0, side * 0.5, 0]}>
      {[-0.09, 0, 0.09].map((y, i) => (
        <mesh key={i} position={[side * 0.22, y, 0]} rotation={[0, 0, side * (i - 1) * 0.18 + Math.PI / 2]} material={m.line}>
          <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * @param getT   opcional: (state) => tempo em segundos (para render determinístico do filme)
 * @param follow se a cabeça acompanha o ponteiro
 */
export default function Kitten({ getT, follow = true, ...props }) {
  const m = useMaterials()
  const head = useRef()
  const eyes = useRef([])
  const body = useRef()
  const tail = useRef()

  useFrame((state, dt) => {
    const t = getT ? getT(state) : state.clock.elapsedTime
    const k = Math.min(1, dt * 4 || 0.1)
    // respiração
    if (body.current) body.current.scale.set(1 + Math.sin(t * 2) * 0.012, 1 - Math.sin(t * 2) * 0.012, 1)
    // cabeça: segue o ponteiro (ou balança suavemente)
    if (head.current) {
      const px = follow ? state.pointer.x : Math.sin(t * 0.7) * 0.4
      const py = follow ? state.pointer.y : Math.sin(t * 0.9) * 0.2
      const ty = px * 0.45
      const tx = -py * 0.25
      const tz = Math.sin(t * 1.1) * 0.05
      if (getT) {
        head.current.rotation.set(tx, ty, tz)
      } else {
        head.current.rotation.x += (tx - head.current.rotation.x) * k
        head.current.rotation.y += (ty - head.current.rotation.y) * k
        head.current.rotation.z = tz
      }
    }
    // piscar a cada ~3.5s
    const ph = t % 3.6
    const blink = ph > 3.45 ? 0.1 : 1
    eyes.current.forEach((e) => e && (e.scale.y = blink))
    if (tail.current) tail.current.rotation.z = Math.sin(t * 1.6) * 0.08
  })

  return (
    <group {...props}>
      <group ref={body}>
        {/* corpo */}
        <mesh position={[0, -1.0, 0]} scale={[1, 0.92, 0.88]} material={m.fur} castShadow>
          <sphereGeometry args={[0.95, 48, 48]} />
        </mesh>
        <mesh position={[0, -0.98, 0.6]} scale={[0.62, 0.62, 0.28]} material={m.cream}>
          <sphereGeometry args={[1, 40, 40]} />
        </mesh>
        {/* patinhas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.42, -1.72, 0.55]} scale={[1, 0.7, 1.15]} material={m.cream}>
            <sphereGeometry args={[0.25, 32, 32]} />
          </mesh>
        ))}
        <group ref={tail}>
          <Tail m={m} />
        </group>
        {/* lápis */}
        <group position={[0.78, -1.18, 0.78]} rotation={[0.5, 0.3, -0.9]}>
          <mesh material={m.pencil}>
            <cylinderGeometry args={[0.075, 0.075, 0.95, 6]} />
          </mesh>
          <mesh position={[0, 0.58, 0]} material={m.wood}>
            <coneGeometry args={[0.075, 0.2, 6]} />
          </mesh>
          <mesh position={[0, 0.665, 0]} material={m.graphite}>
            <coneGeometry args={[0.026, 0.07, 12]} />
          </mesh>
          <mesh position={[0, -0.52, 0]} material={m.pink}>
            <cylinderGeometry args={[0.078, 0.078, 0.12, 12]} />
          </mesh>
        </group>
        {/* pata segurando o lápis */}
        <mesh position={[0.66, -1.12, 0.74]} scale={[1, 0.85, 0.9]} material={m.cream}>
          <sphereGeometry args={[0.2, 24, 24]} />
        </mesh>
      </group>

      {/* cabeça */}
      <group ref={head} position={[0, 0.28, 0.05]}>
        <mesh scale={[1.18, 0.96, 0.95]} material={m.fur} castShadow>
          <sphereGeometry args={[1, 64, 64]} />
        </mesh>
        {/* orelhas */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.66, 0.74, -0.05]} rotation={[0, 0, -s * 0.38]}>
            <mesh material={m.fur}>
              <coneGeometry args={[0.4, 0.72, 32]} />
            </mesh>
            <mesh position={[0, -0.04, 0.17]} scale={[1, 1, 0.5]} material={m.pink}>
              <coneGeometry args={[0.24, 0.5, 32]} />
            </mesh>
          </group>
        ))}
        {/* olhos */}
        {[-1, 1].map((s, i) => (
          <group key={s} position={[s * 0.4, 0.04, 0.83]} ref={(el) => (eyes.current[i] = el)}>
            <mesh scale={[1, 1.12, 0.6]} material={m.eye}>
              <sphereGeometry args={[0.19, 32, 32]} />
            </mesh>
            <mesh position={[0.06, 0.08, 0.1]} material={m.white}>
              <sphereGeometry args={[0.055, 16, 16]} />
            </mesh>
            <mesh position={[-0.05, -0.06, 0.1]} material={m.white}>
              <sphereGeometry args={[0.025, 12, 12]} />
            </mesh>
          </group>
        ))}
        {/* nariz e boca */}
        <mesh position={[0, -0.16, 0.93]} scale={[1.4, 0.85, 0.8]} material={m.pink}>
          <sphereGeometry args={[0.065, 20, 20]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.075, -0.25, 0.905]} rotation={[0.25, 0, Math.PI]} material={m.mouth}>
            <torusGeometry args={[0.075, 0.016, 8, 24, Math.PI]} />
          </mesh>
        ))}
        {/* bochechas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.68, -0.2, 0.69]} rotation={[0, s * 0.75, 0]} scale={[1, 0.62, 0.2]} material={m.blush}>
            <sphereGeometry args={[0.17, 24, 24]} />
          </mesh>
        ))}
        <Whiskers side={-1} m={m} />
        <Whiskers side={1} m={m} />
      </group>
    </group>
  )
}
