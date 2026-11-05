import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'

/**
 * Canvas que só monta quando está perto da tela e pausa o render
 * quando sai dela (economiza GPU/bateria com várias cenas 3D na página).
 */
export default function LazyCanvas({ children, className, camera, eventSource, ...props }) {
  const ref = useRef()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting)
        if (e.isIntersecting) setMounted(true)
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {mounted && (
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={camera ?? { position: [0, 0, 8], fov: 35 }}
          frameloop={visible ? 'always' : 'never'}
          eventSource={eventSource?.current ?? undefined}
          {...props}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  )
}
