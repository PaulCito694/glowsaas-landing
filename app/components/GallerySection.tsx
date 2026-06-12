'use client'

import { useEffect, useRef } from 'react'
import type { GalleryItem } from '@/lib/api'

const DEFAULT_CARDS = [
  { tag: 'nail art · floral', tall: false, title: 'Soft gel almendra' },
  { tag: 'volumen ruso',       tall: true,  title: 'Mirada intensa'   },
  { tag: 'manicure ruso',      tall: false, title: 'Nude impecable'   },
  { tag: 'lifting · tinte',    tall: true,  title: 'Efecto natural'   },
  { tag: 'nail art · cromo',   tall: false, title: 'Cromo espejo'     },
  { tag: 'pelo a pelo',        tall: true,  title: 'Clásico definido' },
  { tag: 'spa de manos',       tall: false, title: 'Ritual completo'  },
]

export default function GallerySection({ items }: { items?: GalleryItem[] }) {
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

  const cards = (items && items.length > 0)
    ? items.map(item => ({ tag: item.tag, tall: item.tall, title: item.title, imageUrl: item.imageUrl }))
    : DEFAULT_CARDS.map(c => ({ ...c, imageUrl: null }))

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
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <span className="ph__tag">{c.tag}</span>
              </div>
              <figcaption className="cap">
                <em>{c.title}</em>
                <span>2026</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
