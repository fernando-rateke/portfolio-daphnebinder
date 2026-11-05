import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import TotoroBadge from './TotoroBadge.jsx'
import Totoro3D from './Totoro3D.jsx'
import { RingBand, SERVICES_TEXT, StudioLights, roundedRectGeometry, prepTextures } from './shared.jsx'

const CARDS = [
  { src: '/work/twitch-02.webp', pos: [-0.6, 2.35, -4.2], rot: [0.12, 0.3, -0.1], w: 1.9 },
  { src: '/work/midia-05.webp', pos: [3.3, 2.5, -6], rot: [-0.05, -0.4, 0.1], w: 1.4 },
  { src: '/work/rastro-02.webp', pos: [4.5, -1.9, -2.6], rot: [0.12, -0.55, -0.12], w: 0.8 },
]

function WorkCard({ tex, pos, rot, w, i }) {
  const img = tex.image
  const h = w * (img.height / img.width)
  const geo = useMemo(() => roundedRectGeometry(w, h, 0.08), [w, h])
  return (
    <Float speed={1.2 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.9}>
      <group position={pos} rotation={rot}>
        <mesh geometry={geo} position={[0.05, -0.05, -0.02]}>
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.18} />
        </mesh>
        <mesh geometry={geo}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  )
}

function Cards() {
  const gl = useThree((s) => s.gl)
  const tex = useTexture(CARDS.map((c) => c.src))
  prepTextures(tex, gl)
  return CARDS.map((c, i) => <WorkCard key={c.src} tex={tex[i]} {...c} i={i} />)
}

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
  return (
    <>
      <Float speed={2} rotationIntensity={1.6} floatIntensity={1.4}>
        <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.16} smoothness={6} position={[-4.6, 2.4, -2]} rotation={[0.5, 0.6, 0]} material={mats.pink} />
      </Float>
      <Float speed={1.6} rotationIntensity={2} floatIntensity={1.2} visible={!mobile}>
        <mesh position={[1.0, -2.4, 0.3]} rotation={[1.1, 0.3, 0]} material={mats.lilac}>
          <torusGeometry args={[0.38, 0.15, 32, 64]} />
        </mesh>
      </Float>
      <Float speed={2.4} rotationIntensity={0.6} floatIntensity={2}>
        <mesh position={[1.1, 2.7, -1.5]} material={mats.ink}>
          <sphereGeometry args={[0.26, 32, 32]} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={1.4} floatIntensity={1.5}>
        <mesh position={[-2.2, 2.9, -0.6]} rotation={[0, 0, 0.8]} material={mats.white}>
          <capsuleGeometry args={[0.13, 0.42, 8, 24]} />
        </mesh>
      </Float>
      <Float speed={2.2} rotationIntensity={1.2} floatIntensity={1.6}>
        <mesh position={[5.3, 0.2, -0.5]} material={mats.pink}>
          <sphereGeometry args={[0.18, 32, 32]} />
        </mesh>
      </Float>
    </>
  )
}

export default function HeroScene() {
  const rig = useRef()
  const { viewport, size } = useThree()
  const mobile = size.width < 820
  const kx = mobile ? 0 : Math.min(2.6, viewport.width * 0.22)
  const ky = mobile ? 1.15 : -0.15
  const scale = mobile ? 0.6 : 0.9

  useFrame((state) => {
    if (!rig.current) return
    const h = window.innerHeight || 1
    const p = Math.min(1.2, window.scrollY / h)
    rig.current.position.y = p * 2.2
    rig.current.rotation.y = p * 0.9 + state.pointer.x * 0.08
    rig.current.rotation.x = -state.pointer.y * 0.05
  })

  return (
    <>
      <StudioLights />
      <group ref={rig}>
        <group position={[kx, ky, 0]} scale={scale}>
          {/* o selo dela ao fundo e o Totoro 3D na frente, como no logo */}
          <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.3}>
            <TotoroBadge radius={1.95} position={[0, 0.2, -1.1]} totoro={false} spin={false} tiltAmount={0.35} />
          </Float>
          <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.45}>
            <Totoro3D position={[0, -0.3, 0.2]} scale={0.92} />
          </Float>
          <RingBand text={SERVICES_TEXT} repeat={1} radius={2.7} height={0.27} rotation={[0.38, 0, -0.16]} position={[0, -0.35, 0]} />
          <ContactShadows position={[0, -1.72, 0]} opacity={0.4} scale={7} blur={2.4} far={3} color="#7a3f74" />
        </group>
        <Shapes mobile={mobile} />
        <Suspense fallback={null}>{!mobile && <Cards />}</Suspense>
      </group>
    </>
  )
}
