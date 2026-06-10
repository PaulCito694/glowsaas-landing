'use client'

import { useEffect, useRef } from 'react'

const cards = [
  { tag: 'nail art · floral', tall: false, title: 'Soft gel almendra', year: '2026' },
  { tag: 'volumen ruso', tall: true, title: 'Mirada intensa', year: '2026' },
  { tag: 'manicure ruso', tall: false, title: 'Nude impecable', year: '2026' },
  { tag: 'lifting · tinte', tall: true, title: 'Efecto natural', year: '2026' },
  { tag: 'nail art · cromo', tall: false, title: 'Cromo espejo', year: '2026' },
  { tag: 'pelo a pelo', tall: true, title: 'Clásico definido', year: '2026' },
  { tag: 'spa de manos', tall: false, title: 'Ritual completo', year: '2026' },
]

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const isMobile = () => window.innerWidth <= 680

    let distance = 0

    const reset = () => {
      section.style.height = ''
      track.style.transform = ''
    }

    const measure = () => {
      if (isMobile()) { reset(); return }
      distance = Math.max(0, track.scrollWidth - window.innerWidth)
      section.style.height = `${window.innerHeight + distance}px`
      onScroll()
    }

    const onScroll = () => {
      if (isMobile()) return
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      let p = -rect.top / (total || 1)
      p = Math.min(1, Math.max(0, p))
      track.style.transform = `translate3d(${-p * distance}px,0,0)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    let rt: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(rt); rt = setTimeout(measure, 150) }
    window.addEventListener('resize', onResize)
    window.addEventListener('load', measure)
    setTimeout(measure, 200)
    measure()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', measure)
      clearTimeout(rt)
    }
  }, [])

  return (
    <section className="gallery" id="galeria" ref={sectionRef}>
      <div className="gallery__sticky">
        <div className="gallery__head">
          <h2 className="serif">El <em>trabajo</em></h2>
          <p>Desliza · Portafolio Velme</p>
        </div>
        <div className="gallery__track" ref={trackRef}>
          {cards.map((c, i) => (
            <figure key={i} className={`gallery__card${c.tall ? ' tall' : ''}`}>
              <div className="ph">
                <span className="ph__tag">{c.tag}</span>
              </div>
              <figcaption className="cap">
                <em>{c.title}</em>
                <span>{c.year}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
