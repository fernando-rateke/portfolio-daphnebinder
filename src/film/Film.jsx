import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, advance, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Kitten from '../three/Kitten.jsx'
import { RingBand, StudioLights, roundedRectGeometry, prepTextures } from '../three/shared.jsx'
import { filmImages } from '../data.js'

/*
 * Filme de introdução (10 s). Tudo é função do tempo `t`, então o mesmo
 * código toca ao vivo no navegador ou é capturado quadro a quadro em vídeo.
 *
 *  0.0 – 2.6  partículas rosa se juntam e formam o selo "GRAPHICS BY DAPHNE BINDER"
 *  2.6 – 6.4  a câmera atravessa o selo e voa por um túnel com os trabalhos
 *  5.9 – 8.5  o gatinho-mascote aparece e o nome "Daphne Binder" sobe
 *  8.9 – 10   transição circular para o rosa do site
 */
export const DURATION = 10
const CAPTURE = new URLSearchParams(location.search).has('capture')
const clock = { t: 0 }
const getT = () => clock.t

// ---------- easing ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const seg = (t, a, b) => clamp01((t - a) / (b - a))
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const outExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x))
const outCubic = (x) => 1 - Math.pow(1 - x, 3)
const outBack = (x) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

const RING_TILT = [0.32, 0, -0.16]
const KITTEN_Z = -66
const TUNNEL_END = -58

// ---------- câmera ----------
function CameraRig() {
  const { camera, size, scene } = useThree()
  const portrait = size.height > size.width
  useFrame(() => {
    const t = getT()
    camera.fov = portrait ? 62 : 40
    let z = 10 - 2.5 * outCubic(seg(t, 0, 2.6))
    const k = seg(t, 2.6, 6.4)
    z += (TUNNEL_END - 7.5) * (0.65 * k + 0.35 * inOut(k))
    z -= 0.6 * seg(t, 6.4, DURATION)
    camera.position.set(Math.sin(t * 0.6) * 0.15, Math.cos(t * 0.5) * 0.1, z)
    const look = t < 2.6 ? 0 : z - 10
    camera.lookAt(0, 0, Math.min(look, z - 1))
    camera.rotation.z = Math.sin(seg(t, 2.6, 6.4) * Math.PI) * 0.18
    camera.updateProjectionMatrix()
    if (scene.fog) {
      const f = seg(t, 2.5, 3.4)
      scene.fog.near = 8 - 1 * f
      scene.fog.far = 11 + 27 * f
    }
  })
  return null
}

// ---------- partículas que formam o anel ----------
const ringVert = /* glsl */ `
  attribute vec3 aStart;
  attribute float aAngle;
  attribute float aR;
  attribute float aY;
  attribute float aSize;
  uniform float uT;
  uniform float uMix;
  uniform float uPx;
  varying float vA;
  void main() {
    float a = aAngle - uT * 0.25;
    vec3 target = vec3(cos(a) * aR, aY, sin(a) * aR);
    vec3 p = mix(aStart, target, uMix);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (10.0 / -mv.z);
    vA = 0.55 + 0.45 * uMix;
  }
`
const pointFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vA * uOpacity);
  }
`

function RingParticles({ count = 1800 }) {
  const mat = useRef()
  const size = useThree((s) => s.size)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const start = new Float32Array(count * 3)
    const angle = new Float32Array(count)
    const r = new Float32Array(count)
    const y = new Float32Array(count)
    const sz = new Float32Array(count)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const rad = 6 + rnd() * 9
      const s = Math.sqrt(1 - u * u)
      start.set([Math.cos(th) * s * rad, u * rad, Math.sin(th) * s * rad], i * 3)
      angle[i] = rnd() * Math.PI * 2
      r[i] = 2.4 + (rnd() - 0.5) * 0.7
      y[i] = (rnd() - 0.5) * 0.5
      sz[i] = 0.9 + rnd() * 2.2
    }
    g.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3))
    g.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
    g.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1))
    g.setAttribute('aR', new THREE.BufferAttribute(r, 1))
    g.setAttribute('aY', new THREE.BufferAttribute(y, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)
    return g
  }, [count])
  const uniforms = useMemo(
    () => ({ uT: { value: 0 }, uMix: { value: 0 }, uPx: { value: 1 }, uColor: { value: new THREE.Color('#f3cef0') }, uOpacity: { value: 1 } }),
    [],
  )
  useFrame(() => {
    const t = getT()
    const u = mat.current?.uniforms
    if (!u) return
    u.uT.value = t
    u.uMix.value = inOut(seg(t, 0.05, 2.3))
    u.uPx.value = Math.min(size.width, size.height) / 400
    u.uOpacity.value = 1 - seg(t, 3.0, 3.6)
  })
  return (
    <points geometry={geo} rotation={RING_TILT}>
      <shaderMaterial ref={mat} vertexShader={ringVert} fragmentShader={pointFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function IntroRing() {
  const size = useThree((s) => s.size)
  const portrait = size.height > size.width
  return (
    <group scale={portrait ? 0.66 : 1}>
      <RingParticles />
      <RingBand radius={2.4} height={0.34} color="#f3cef0" getT={getT} rotation={RING_TILT} getOpacity={() => seg(getT(), 1.2, 2.3)} />
    </group>
  )
}

// ---------- poeira e linhas de velocidade no túnel ----------
const dustVert = /* glsl */ `
  attribute float aSize;
  uniform float uPx;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (10.0 / -mv.z);
    vA = smoothstep(-45.0, -4.0, mv.z) * 0.8;
  }
`
function TunnelDust({ count = 2600 }) {
  const size = useThree((s) => s.size)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    const s = new Float32Array(count)
    let seed = 99
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2
      const r = 2.2 + Math.pow(rnd(), 0.6) * 9
      p.set([Math.cos(a) * r, Math.sin(a) * r, 8 - rnd() * 85], i * 3)
      s[i] = 0.4 + rnd() * 1.4
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(s, 1))
    return g
  }, [count])
  const uniforms = useMemo(() => ({ uPx: { value: 1 }, uColor: { value: new THREE.Color('#f7dff4') }, uOpacity: { value: 1 } }), [])
  const mat = useRef()
  useFrame(() => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uPx.value = Math.min(size.width, size.height) / 400
    u.uOpacity.value = 0.25 + 0.75 * seg(getT(), 1.5, 3)
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={dustVert} fragmentShader={pointFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function SpeedLines({ count = 90 }) {
  const ref = useRef()
  const data = useMemo(() => {
    let seed = 3
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: count }, () => {
      const a = rnd() * Math.PI * 2
      const r = 3 + rnd() * 5
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: -2 - rnd() * 66, l: 1.5 + rnd() * 4 }
    })
  }, [count])
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#f39be9', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  )
  useFrame(() => {
    const t = getT()
    // aparecem com a velocidade da câmera
    const v = Math.sin(seg(t, 2.6, 6.4) * Math.PI)
    mat.opacity = 0.65 * v
    if (ref.current) ref.current.children.forEach((m) => (m.scale.z = 0.4 + v * 1.6))
  })
  return (
    <group ref={ref}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} material={mat}>
          <boxGeometry args={[0.02, 0.02, d.l]} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- túnel de trabalhos ----------
function WorkTunnel() {
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const portrait = size.height > size.width
  const tex = useTexture(filmImages)
  prepTextures(tex, gl)
  const border = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f3cef0' }), [])
  const cards = useMemo(
    () =>
      tex.map((t, i) => {
        const w = portrait ? 1.25 : 1.7
        const h = Math.min(w * 1.6, w * (t.image.height / t.image.width))
        const a = i * 2.39996 + 0.6 // ângulo dourado
        const rx = portrait ? 1.55 : 3.0
        const ry = portrait ? 2.9 : 1.75
        const x = Math.cos(a) * rx
        const y = Math.sin(a) * ry
        return {
          t,
          w,
          h,
          pos: [x, y, -7 - i * 2.45],
          rot: [y * 0.1, -x * 0.12, (i % 2 ? 1 : -1) * 0.06],
          geo: roundedRectGeometry(w, h, 0.07),
          rim: roundedRectGeometry(w + 0.06, h + 0.06, 0.1),
        }
      }),
    [tex, portrait],
  )
  return cards.map((c, i) => (
    <group key={i} position={c.pos} rotation={c.rot}>
      <mesh geometry={c.rim} position={[0, 0, -0.005]} material={border} />
      <mesh geometry={c.geo}>
        <meshBasicMaterial map={c.t} toneMapped={false} />
      </mesh>
    </group>
  ))
}

// ---------- mascote final ----------
function Finale() {
  const ref = useRef()
  const size = useThree((s) => s.size)
  const portrait = size.height > size.width
  useFrame(() => {
    const t = getT()
    const p = seg(t, 5.9, 6.9)
    const s = Math.max(0.0001, outBack(p)) * (portrait ? 0.74 : 0.8)
    if (ref.current) {
      ref.current.scale.setScalar(s)
      ref.current.rotation.y = (1 - outCubic(p)) * -1.4 + Math.sin(t * 0.8) * 0.12
      ref.current.position.y = (portrait ? 1.45 : 0.75) + Math.sin(t * 1.4) * 0.05
    }
  })
  return (
    <group ref={ref} position={[0, 0.85, KITTEN_Z]}>
      <Kitten getT={getT} follow={false} />
      <RingBand radius={2.35} height={0.34} color="#f3cef0" getT={getT} speed={0.35} rotation={RING_TILT} position={[0, -0.25, 0]} />
    </group>
  )
}

function Driver({ onReady }) {
  const scene = useThree((s) => s.scene)
  if (import.meta.env.DEV) window.__scene = scene
  useFrame((state) => {
    if (!CAPTURE) clock.t = state.clock.elapsedTime % (DURATION + 1)
    applyOverlay(clock.t)
  })
  useEffect(() => {
    // espera fontes e texturas
    document.fonts.ready.then(() => setTimeout(onReady, 300))
  }, [onReady])
  return null
}

// ---------- camada de texto (DOM) ----------
const WORDS = ['Twitch Graphics', 'Identidade Visual', 'Mídia Kits', 'Social Media', 'UI/UX Design']
const NAME = 'Daphne Binder'
const els = {}
function applyOverlay(t) {
  if (!els.since) return
  els.since.style.opacity = seg(t, 0.9, 1.6) * (1 - seg(t, 2.2, 2.6))
  els.since.style.transform = `translate(-50%,-50%) scale(${0.92 + 0.08 * outCubic(seg(t, 0.9, 2.2))})`
  WORDS.forEach((_, i) => {
    const s = 2.7 + i * 0.68
    const k = seg(t, s, s + 0.12) * (1 - seg(t, s + 0.56, s + 0.68))
    const x = -4 * (1 - outExpo(seg(t, s, s + 0.5))) + 2 * seg(t, s + 0.5, s + 0.68)
    const el = els['w' + i]
    el.style.opacity = k
    el.style.transform = `translateX(${x}vmin)`
  })
  els.letters.forEach((el, i) => {
    const p = outExpo(seg(t, 6.75 + i * 0.045, 7.65 + i * 0.045))
    el.style.transform = `translateY(${(1 - p) * 110}%)`
  })
  els.sub.style.opacity = seg(t, 7.6, 8.2)
  els.sub.style.transform = `translateY(${(1 - outCubic(seg(t, 7.6, 8.3))) * 1.2}vmin)`
  const diag = Math.hypot(window.innerWidth, window.innerHeight)
  els.wipe.style.transform = `scale(${inOut(seg(t, 8.9, 9.7)) * (diag / 10) * 1.04})`
}

function Overlay() {
  const letters = []
  let n = 0
  const name = NAME.split(' ').map((word, wi) => (
    <span key={wi} className={wi ? 'ov__br' : ''}>
      {wi ? ' ' : ''}
      {word.split('').map((ch) => {
        const idx = n++
        return (
          <i key={idx} ref={(el) => (letters[idx] = el)}>
            {ch}
          </i>
        )
      })}
    </span>
  ))
  els.letters = letters
  return (
    <div className="ov">
      <div className="ov__since" ref={(el) => (els.since = el)}>
        since 2015
        <small>portfólio</small>
      </div>
      {WORDS.map((w, i) => (
        <div key={w} className="ov__word" ref={(el) => (els['w' + i] = el)}>
          <small>{String(i + 1).padStart(2, '0')} —</small>
          {w}
        </div>
      ))}
      <div className="ov__title">
        <div className="ov__name">{name}</div>
        <div className="ov__sub" ref={(el) => (els.sub = el)}>
          Designer · since 2015
        </div>
      </div>
      <div className="ov__grain" />
      <div className="ov__wipe" ref={(el) => (els.wipe = el)} />
    </div>
  )
}

export default function Film() {
  const ready = useRef({ scene: false, tex: false })
  const mark = (k) => () => {
    ready.current[k] = true
    if (ready.current.scene && ready.current.tex) window.__ready = true
  }

  useEffect(() => {
    window.__frame = (t) => {
      clock.t = t
      applyOverlay(t)
      advance(performance.now())
      return true
    }
  }, [])

  return (
    <div className="film">
      <Canvas
        frameloop={CAPTURE ? 'never' : 'always'}
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 10], fov: 40, near: 0.1, far: 120 }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <fog attach="fog" args={['#1a1a1a', 7, 38]} />
        <Driver onReady={mark('scene')} />
        <CameraRig />
        <StudioLights />
        <IntroRing />
        <TunnelDust />
        <SpeedLines />
        <Suspense fallback={null}>
          <WorkTunnel />
          <Finale />
          <TexReady onReady={mark('tex')} />
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  )
}

function TexReady({ onReady }) {
  useEffect(() => {
    const id = setTimeout(onReady, 500)
    return () => clearTimeout(id)
  }, [onReady])
  return null
}
