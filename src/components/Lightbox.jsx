import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const Ctx = createContext(() => {})
export const useLightbox = () => useContext(Ctx)

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null) // { images:[{src,title}], index }
  const open = useCallback((images, index = 0) => setState({ images, index }), [])
  const close = () => setState(null)
  const go = useCallback(
    (d) => setState((s) => s && { ...s, index: (s.index + d + s.images.length) % s.images.length }),
    [],
  )

  useEffect(() => {
    if (!state) return
    window.__lenis?.stop()
    const key = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      window.__lenis?.start()
    }
  }, [state, go])

  const cur = state?.images[state.index]
  return (
    <Ctx.Provider value={open}>
      {children}
      {state && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={cur.title || 'Imagem'} onClick={close}>
          <figure className="lightbox__fig" onClick={(e) => e.stopPropagation()}>
            <img key={cur.src} src={cur.src} alt={cur.title || ''} />
            {cur.title && (
              <figcaption>
                {cur.title}
                {state.images.length > 1 && <span> {state.index + 1} / {state.images.length}</span>}
              </figcaption>
            )}
          </figure>
          {state.images.length > 1 && (
            <>
              <button className="lightbox__nav lightbox__nav--prev" aria-label="Anterior" onClick={(e) => (e.stopPropagation(), go(-1))}>‹</button>
              <button className="lightbox__nav lightbox__nav--next" aria-label="Próxima" onClick={(e) => (e.stopPropagation(), go(1))}>›</button>
            </>
          )}
          <button className="lightbox__close" aria-label="Fechar" onClick={close}>×</button>
        </div>
      )}
    </Ctx.Provider>
  )
}
