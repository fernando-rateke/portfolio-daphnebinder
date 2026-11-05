import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Totoro em 3D, no estilo da silhueta da identidade da Daphne:
// corpo em formato de pera, barriga clara com as três marquinhas,
// orelhas pontudas, olhos redondos e bigodes.

const COLORS = {
  body: '#8f8a99',
  belly: '#f3ead2',
  dark: '#2b2a30',
  white: '#ffffff',
  nose: '#3a3840',
}

// perfil do corpo (raio, altura) — girado em torno do eixo Y
const PROFILE = [
  [0.0, -1.3],
  [0.55, -1.27],
  [0.92, -1.12],
  [1.14, -0.82],
  [1.22, -0.45],
  [1.2, -0.05],
  [1.1, 0.35],
  [0.94, 0.7],
  [0.72, 0.98],
  [0.42, 1.16],
  [0.0, 1.22],
]
const DEPTH = 0.86 // achata um pouco no eixo Z

function profileCurve() {
  return new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)))
}

/** Raio do corpo numa altura y (para posicionar detalhes na superfície). */
function radiusAt(curve, y) {
  const pts = curve.getSpacedPoints(200)
  let best = pts[0]
  for (const p of pts) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p
  return best.x
}
/** Ponto na superfície frontal do corpo em (x, y). */
function surface(curve, x, y, lift = 0) {
  const r = radiusAt(curve, y)
  const z = Math.sqrt(Math.max(0, r * r - x * x)) * DEPTH
  return [x, y, z + lift]
}
/** Euler que alinha o eixo +Z de um detalhe com a normal n. */
function alignTo(n) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n.normalize())
  const e = new THREE.Euler().setFromQuaternion(q)
  return [e.x, e.y, e.z]
}
/** Rotação pela normal do corpo (superfície x² + (z/D)² = r(y)²). */
function faceRot(curve, x, y) {
  const [, , z] = surface(curve, x, y)
  const r = radiusAt(curve, y)
  const dr = (radiusAt(curve, y + 0.02) - radiusAt(curve, y - 0.02)) / 0.04
  return alignTo(new THREE.Vector3(x, -r * dr, z / (DEPTH * DEPTH)))
}
// barriga: elipsoide
const BELLY = { c: [0, -0.42, 0.56], r: [0.9, 0.78, 0.6] }
function onBelly(x, y, lift = 0) {
  const [cx, cy, cz] = BELLY.c
  const [a, b, c] = BELLY.r
  const k = 1 - ((x - cx) / a) ** 2 - ((y - cy) / b) ** 2
  const z = cz + c * Math.sqrt(Math.max(0, k))
  const n = new THREE.Vector3((x - cx) / (a * a), (y - cy) / (b * b), (z - cz) / (c * c))
  return { pos: [x, y, z + lift], rot: alignTo(n) }
}

export default function Totoro3D({ getT, follow = true, ...props }) {
  const curve = useMemo(profileCurve, [])
  const root = useRef()
  const body = useRef()
  const ears = useRef([])
  const eyes = useRef([])

  const m = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color: COLORS.body, roughness: 0.62, sheen: 1, sheenColor: new THREE.Color('#f3cef0'), sheenRoughness: 0.5, clearcoat: 0.15 }),
      belly: new THREE.MeshPhysicalMaterial({ color: COLORS.belly, roughness: 0.6, sheen: 0.6, sheenColor: new THREE.Color('#ffffff') }),
      dark: new THREE.MeshPhysicalMaterial({ color: COLORS.dark, roughness: 0.3, clearcoat: 0.8 }),
      white: new THREE.MeshPhysicalMaterial({ color: COLORS.white, roughness: 0.25, clearcoat: 0.6 }),
      pupil: new THREE.MeshPhysicalMaterial({ color: '#111014', roughness: 0.05, clearcoat: 1 }),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      whisker: new THREE.MeshStandardMaterial({ color: COLORS.dark, roughness: 0.5 }),
      chevron: new THREE.MeshPhysicalMaterial({ color: '#7d7887', roughness: 0.6 }),
    }),
    [],
  )

  const geo = useMemo(() => {
    const lathe = new THREE.LatheGeometry(curve.getSpacedPoints(64), 96)
    lathe.scale(1, 1, DEPTH)
    lathe.computeVertexNormals()
    // barriga: calota oval que acompanha a frente do corpo
    const belly = new THREE.SphereGeometry(1, 64, 48)
    // orelha: gota alongada
    const ear = new THREE.LatheGeometry(
      new THREE.SplineCurve([
        new THREE.Vector2(0, -0.32),
        new THREE.Vector2(0.15, -0.24),
        new THREE.Vector2(0.19, 0.0),
        new THREE.Vector2(0.15, 0.24),
        new THREE.Vector2(0.06, 0.42),
        new THREE.Vector2(0, 0.47),
      ]).getSpacedPoints(32),
      32,
    )
    ear.scale(1, 1, 0.62)
    ear.computeVertexNormals()
    // marquinha da barriga (arco ^)
    const chevron = new THREE.TorusGeometry(0.15, 0.045, 12, 32, Math.PI * 0.8)
    chevron.rotateZ(Math.PI * 0.1)
    return { lathe, belly, ear, chevron }
  }, [curve])

  // posições na superfície
  const P = useMemo(() => {
    const eye = (s) => ({ pos: surface(curve, s * 0.43, 0.5, 0.0), rot: faceRot(curve, s * 0.43, 0.5) })
    const chev = (x, y) => onBelly(x, y, -0.02)
    return {
      eyes: [eye(-1), eye(1)],
      nose: { pos: surface(curve, 0, 0.6, 0.0), rot: faceRot(curve, 0, 0.6) },
      chevrons: [chev(-0.34, -0.17), chev(0, -0.1), chev(0.34, -0.17)],
      whiskerRoot: (s) => surface(curve, s * 0.66, 0.38, -0.05),
    }
  }, [curve])

  useFrame((state, dt) => {
    const t = getT ? getT(state) : state.clock.elapsedTime
    // balanço e respiração
    if (body.current) {
      const b = Math.sin(t * 2.1) * 0.015
      body.current.scale.set(1 + b, 1 - b, 1 + b)
      body.current.rotation.z = Math.sin(t * 0.9) * 0.035
    }
    // segue o ponteiro
    if (root.current) {
      const ty = follow ? state.pointer.x * 0.55 : Math.sin(t * 0.6) * 0.3
      const tx = follow ? -state.pointer.y * 0.18 : 0
      if (getT) root.current.rotation.set(tx, ty, 0)
      else {
        const k = Math.min(1, dt * 3.5)
        root.current.rotation.y += (ty - root.current.rotation.y) * k
        root.current.rotation.x += (tx - root.current.rotation.x) * k
      }
    }
    // orelhas mexem de vez em quando
    const twitch = Math.max(0, Math.sin(t * 3.3)) ** 24 * 0.25
    ears.current.forEach((e, i) => e && (e.rotation.z = (i ? -1 : 1) * (0.12 + (i ? twitch : twitch * 0.6))))
    // piscar
    const blink = t % 4.2 > 4.05 ? 0.12 : 1
    eyes.current.forEach((e) => e && (e.scale.y = blink))
  })

  return (
    <group {...props}>
      <group ref={root}>
        <group ref={body}>
          {/* corpo */}
          <mesh geometry={geo.lathe} material={m.body} castShadow />
          {/* barriga */}
          <mesh geometry={geo.belly} material={m.belly} position={BELLY.c} scale={BELLY.r} />
          {/* marquinhas ^ ^ ^ */}
          {P.chevrons.map((c, i) => (
            <group key={i} position={c.pos} rotation={c.rot}>
              <mesh geometry={geo.chevron} material={m.chevron} scale={[1.25, 1.05, 0.7]} />
            </group>
          ))}
          {/* orelhas */}
          {[-1, 1].map((s, i) => (
            <group key={s} position={[s * 0.42, 1.08, -0.05]} ref={(el) => (ears.current[i] = el)}>
              <mesh geometry={geo.ear} material={m.body} position={[0, 0.36, 0]} />
            </group>
          ))}
          {/* olhos */}
          {P.eyes.map((e, i) => (
            <group key={i} position={e.pos} rotation={e.rot}>
              <group ref={(el) => (eyes.current[i] = el)}>
                <mesh material={m.white} scale={[1, 1, 0.42]}>
                  <sphereGeometry args={[0.15, 32, 24]} />
                </mesh>
                <mesh material={m.pupil} position={[i ? -0.015 : 0.015, 0, 0.05]} scale={[1, 1, 0.5]}>
                  <sphereGeometry args={[0.07, 24, 16]} />
                </mesh>
                <mesh material={m.shine} position={[i ? -0.035 : -0.005, 0.03, 0.085]}>
                  <sphereGeometry args={[0.02, 12, 8]} />
                </mesh>
              </group>
            </group>
          ))}
          {/* nariz */}
          <group position={P.nose.pos} rotation={P.nose.rot}>
            <mesh material={m.dark} scale={[1.6, 0.65, 0.5]}>
              <sphereGeometry args={[0.07, 24, 16]} />
            </mesh>
          </group>
          {/* bigodes */}
          {[-1, 1].map((s) =>
            [-0.09, 0, 0.09].map((dy, j) => {
              const [x, y, z] = P.whiskerRoot(s)
              const len = 0.62
              const ang = (j - 1) * 0.16 * s
              return (
                <mesh
                  key={`${s}${j}`}
                  material={m.whisker}
                  position={[x + s * (len / 2) * Math.cos(ang), y + dy + Math.sin(ang) * len * 0.5, z]}
                  rotation={[0, 0, Math.PI / 2 + ang]}
                >
                  <cylinderGeometry args={[0.012, 0.018, len, 6]} />
                </mesh>
              )
            }),
          )}
          {/* bracinhos */}
          {[-1, 1].map((s) => (
            <mesh key={s} material={m.body} position={[s * 1.12, -0.3, 0.12]} rotation={[0.2, 0, s * 0.35]} scale={[0.26, 0.48, 0.24]}>
              <sphereGeometry args={[1, 24, 24]} />
            </mesh>
          ))}
          {/* pezinhos */}
          {[-1, 1].map((s) => (
            <mesh key={s} material={m.body} position={[s * 0.5, -1.22, 0.42]} scale={[0.3, 0.15, 0.32]}>
              <sphereGeometry args={[1, 24, 16]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
