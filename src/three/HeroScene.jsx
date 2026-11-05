import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import TotoroBadge from './TotoroBadge.jsx'
import Totoro3D from './Totoro3D.jsx'
import { StudioLights } from './shared.jsx'

/*
 * Composição do hero: tudo vive num "palco" centralizado na coluna da direita
 * (no desktop) ou no topo (no celular), e escala com o tamanho da tela —
 * nada cruza o título nem encosta nas bordas.
 */

// formas decorativas, em coordenadas relativas ao centro do selo
const SHAPES = [
  { kind: 'sphere', pos: [-2.15, 1.75, -1.4], size: 0.24, mat: 'ink', speed: 2.2 },
  { kind: 'cube', pos: [1.95, 1.8, -1.3], size: 0.55, mat: 'pink', speed: 1.8 },
  { kind: 'torus', pos: [1.95, -1.6, 0.2], size: 0.32, mat: 'lilac', speed: 1.5 },
  { kind: 'capsule', pos: [-2.2, -1.45, 0.3], size: 0.12, mat: 'white', speed: 1.9 },
  { kind: 'sphere', pos: [2.3, 0.25, -0.6], size: 0.14, mat: 'pink', speed: 2.4, desktopOnly: true },
]

function Shapes({ mobile }) {
  const mats = useMemo(
    () => ({
      pink: new THREE.MeshPhysicalMaterial({ color: '#f39be9', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }),
      lilac: new THREE.MeshPhysicalMaterial({ color: '#c8a2f5', roughness: 0.3, clearcoat: 1 }),
      ink: new THREE.MeshPhysicalMaterial({ color: '#1f1e24', roughness: 0.25, clearcoat: 1 }),
      white: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, clearcoat: 1 }),
    }),
    [],
  )
  return SHAPES.filter((s) => !(mobile && s.desktopOnly)).map((s, i) => (
    <Float key={i} speed={s.speed} rotationIntensity={1.4} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
      {s.kind === 'cube' && (
        <RoundedBox args={[s.size, s.size, s.size]} radius={s.size * 0.24} smoothness={6} position={s.pos} rotation={[0.5, 0.6, 0]} material={mats[s.mat]} />
      )}
      {s.kind === 'sphere' && (
        <mesh position={s.pos} material={mats[s.mat]}>
          <sphereGeometry args={[s.size, 32, 32]} />
        </mesh>
      )}
      {s.kind === 'torus' && (
        <mesh position={s.pos} rotation={[1.1, 0.3, 0]} material={mats[s.mat]}>
          <torusGeometry args={[s.size, s.size * 0.4, 32, 64]} />
        </mesh>
      )}
      {s.kind === 'capsule' && (
        <mesh position={s.pos} rotation={[0, 0, 0.8]} material={mats[s.mat]}>
          <capsuleGeometry args={[s.size, s.size * 3.2, 8, 24]} />
        </mesh>
      )}
    </Float>
  ))
}

export default function HeroScene() {
  const rig = useRef()
  const { viewport, size } = useThree()
  const mobile = size.width < 820

  // largura útil: no desktop, a metade direita da tela; no celular, a tela toda
  const halfW = viewport.width / 2
  const halfH = viewport.height / 2
  const columnW = mobile ? viewport.width : halfW
  const cx = mobile ? 0 : halfW / 2 + 0.15
  // o palco tem ~5.4 x 4.6 unidades (selo + formas); cabe na coluna e na altura
  const scale = Math.min(1, (columnW * 0.9) / 5.8, (halfH * 2 * 0.86) / 4.6)
  const cy = mobile ? 0 : -0.1

  useFrame((state) => {
    if (!rig.current) return
    const h = window.innerHeight || 1
    const p = Math.min(1.2, window.scrollY / h)
    rig.current.position.y = cy + p * 2.2
    rig.current.rotation.y = p * 0.9 + state.pointer.x * 0.06
    rig.current.rotation.x = -state.pointer.y * 0.04
  })

  return (
    <>
      <StudioLights />
      <group position={[cx, 0, 0]}>
        <group ref={rig} scale={scale}>
          {/* o selo dela ao fundo e o Totoro 3D na frente, como no logo */}
          <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
            <TotoroBadge radius={1.95} position={[0, 0.2, -1.1]} totoro={false} spin={false} tiltAmount={0.35} />
          </Float>
          <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.45} floatingRange={[-0.06, 0.06]}>
            <Totoro3D position={[0, -0.3, 0.2]} scale={0.92} />
          </Float>
          <ContactShadows position={[0, -1.72, 0]} opacity={0.4} scale={6} blur={2.4} far={3} color="#7a3f74" />
          <Shapes mobile={mobile} />
        </group>
      </group>
    </>
  )
}
