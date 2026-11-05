const links = [
  ['#sobre', 'Sobre'],
  ['#trabalhos', 'Trabalhos'],
  ['#uiux', 'UI/UX'],
  ['#contato', 'Contato'],
]

export const scrollTo = (hash) => {
  const el = document.querySelector(hash)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export default function Nav({ onReplay }) {
  return (
    <header className="nav">
      <a href="#top" className="nav__logo" onClick={(e) => (e.preventDefault(), scrollTo('#top'))}>
        Daphne<b>Binder</b>
      </a>
      <nav aria-label="Seções">
        {links.map(([h, l]) => (
          <a key={h} href={h} className={h === '#contato' ? 'nav__cta' : ''} onClick={(e) => (e.preventDefault(), scrollTo(h))}>
            {l}
          </a>
        ))}
        <button className="nav__replay" onClick={onReplay} title="Assistir à intro novamente" aria-label="Assistir à intro novamente">
          ▶
        </button>
      </nav>
    </header>
  )
}
