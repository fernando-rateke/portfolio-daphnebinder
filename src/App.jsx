import { useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Intro from './components/Intro.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Marquee from './components/Marquee.jsx'
import Twitch from './components/Twitch.jsx'
import Identity from './components/Identity.jsx'
import MediaKits from './components/MediaKits.jsx'
import Manu from './components/Manu.jsx'
import UIUX from './components/UIUX.jsx'
import Contact from './components/Contact.jsx'
import Cursor from './components/Cursor.jsx'
import { LightboxProvider } from './components/Lightbox.jsx'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function shouldPlayIntro() {
  if (reducedMotion()) return false
  const q = new URLSearchParams(location.search)
  if (q.has('intro')) return true
  if (q.has('nointro')) return false
  try {
    return !sessionStorage.getItem('intro-seen')
  } catch {
    return true
  }
}

/** Divide o texto de [data-split] em palavras para animar. */
function splitWords(el) {
  if (el.dataset.splitDone) return el.querySelectorAll('.w > span')
  const words = el.textContent.trim().split(/\s+/)
  el.setAttribute('aria-label', el.textContent.trim())
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ')
  el.dataset.splitDone = '1'
  return el.querySelectorAll('.w > span')
}

export default function App() {
  const [intro, setIntro] = useState(shouldPlayIntro)

  // Smooth scroll (Lenis) + ScrollTrigger
  useEffect(() => {
    if (reducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  // trava a rolagem durante a intro
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', intro)
    if (intro) window.__lenis?.stop()
    else window.__lenis?.start()
  }, [intro])

  // Animações de scroll
  useLayoutEffect(() => {
    if (intro) return
    const ctx = gsap.context(() => {
      const rm = reducedMotion()

      // entrada do hero
      gsap.from('[data-hero]', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.15 })
      gsap.from('.hero__title span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.1 })

      if (rm) return

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      gsap.utils.toArray('[data-split]').forEach((el) => {
        const words = splitWords(el)
        gsap.from(words, {
          yPercent: 115,
          rotate: 4,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })

      // contadores
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        const plain = el.dataset.plain
        const start = plain ? end - 10 : 0
        const o = { v: start }
        gsap.to(o, {
          v: end,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => (el.textContent = Math.round(o.v) + (el.dataset.suffix || '')),
        })
      })

      // cartões de título: texto com leve parallax
      gsap.utils.toArray('.titlecard').forEach((el) => {
        gsap.fromTo(
          el.querySelector('.titlecard__title'),
          { xPercent: -4 },
          { xPercent: 4, ease: 'none', scrollTrigger: { trigger: el, scrub: true } },
        )
      })

      // parallax da imagem da Manu
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: true } })
      })

      // mídia kits: rolagem horizontal fixada (desktop)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const track = document.querySelector('.kits__track')
        const pin = document.querySelector('.kits__pin')
        if (!track || !pin) return
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        gsap.utils.toArray('.kit').forEach((k, i) => {
          gsap.from(k, {
            rotateY: -35,
            z: -200,
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: pin, start: `top+=${i * 140 - 400} top`, end: `top+=${i * 140 + 200} top`, scrub: true },
          })
        })
      })

      // imagens carregando tarde podem mudar alturas
      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      setTimeout(refresh, 1200)
      return () => window.removeEventListener('load', refresh)
    })
    return () => ctx.revert()
  }, [intro])

  const replay = () => {
    window.scrollTo(0, 0)
    window.__lenis?.scrollTo(0, { immediate: true })
    setIntro(true)
  }

  return (
    <LightboxProvider>
      {intro && <Intro onDone={() => setIntro(false)} />}
      <Cursor />
      <Nav onReplay={replay} />
      <main>
        <Hero />
        <Marquee items={['Twitch Graphics', 'Identidade Visual', 'Mídia Kits', 'Social Media', 'UI/UX Design']} tone="ink" />
        <About />
        <Twitch />
        <Identity />
        <MediaKits />
        <Manu />
        <UIUX />
        <Marquee items={['Vamos conversar', 'daphne.binder@live.com', 'Since 2015']} tone="pink" reverse />
        <Contact />
      </main>
    </LightboxProvider>
  )
}
