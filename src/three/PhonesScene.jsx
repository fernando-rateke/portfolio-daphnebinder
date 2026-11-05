import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { StudioLights, roundedRectGeometry, prepTextures } from './shared.jsx'

const PW = 1.0
const PH = 2.12
const SW = 0.92
const SH = 1.98

function Phone({ tex, i, n, flip, onOpen }) {
  const ref = useRef()
  const inner = useRef()
  const screen = useMemo(() => roundedRectGeometry(SW, SH, 0.1), [])
  const frameMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#1d1c22', roughness: 0.25, metalness: 0.4, clearcoat: 1 }),
    [],
  )
  const off = i - (n - 1) / 2
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) ref.current.position.y = Math.sin(t * 1.1 + i * 0.9) * 0.08
    if (inner.current) {
      // giro 360° escalonado quando o projeto troca
      const local = THREE.MathUtils.clamp((t - flip.current.at - i * 0.08) / 0.9, 0, 1)
      const e = 1 - Math.pow(1 - local, 3)
      inner.current.rotation.y = (1 - e) * -Math.PI * 2
    }
  })
  return (
    <group position={[off * 1.28, 0, -Math.abs(off) * 0.55]} rotation={[0, -off * 0.22, 0]}>
      <group ref={ref}>
        <group ref={inner}>
          <RoundedBox args={[PW, PH, 0.09]} radius={0.04} smoothness={4} material={frameMat} />
          <mesh
            geometry={screen}
            position={[0, 0, 0.047]}
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.(i)
            }}
            onPointerOver={() => (document.body.style.cursor = 'zoom-in')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          {/* câmera / notch */}
          <mesh position={[0, SH / 2 - 0.06, 0.05]}>
            <capsuleGeometry args={[0.022, 0.12, 4, 12]} />
            <meshBasicMaterial color="#0b0b0e" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function PhonesScene({ screens, projectId, onOpen }) {
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const tex = useTexture(screens)
  prepTextures(tex, gl)
  const rig = useRef()
  const flip = useRef({ at: -10 })
  const clock = useThree((s) => s.clock)

  useEffect(() => {
    flip.current.at = clock.elapsedTime
  }, [projectId, clock])

  const mobile = size.width < 640
  useFrame((state, dt) => {
    if (!rig.current) return
    const k = Math.min(1, dt * 3)
    rig.current.rotation.y += (state.pointer.x * 0.35 - rig.current.rotation.y) * k
    rig.current.rotation.x += (-state.pointer.y * 0.15 - rig.current.rotation.x) * k
    state.camera.position.z = mobile ? 6.6 : 4.7
  })

  return (
    <>
      <StudioLights intensity={0.9} />
      <group ref={rig}>
        {tex.map((t, i) => (
          <Phone key={i} tex={t} i={i} n={tex.length} flip={flip} onOpen={onOpen} />
        ))}
      </group>
    </>
  )
}
