'use client'

import { useEffect, useRef, useState } from 'react'
import { fmt } from '../data/velme'
import type { Service } from '@/lib/api'
import { durStr } from '@/lib/api'

const PER_VIEW = () => {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth < 620) return 1
  if (window.innerWidth < 1000) return 2
  return 3
}

export default function ServicesSection({ services }: { services: Service[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [dotsCount, setDotsCount] = useState(0)

  const list = services.slice(0, 6)

  const maxIndex = () => Math.max(0, list.length - PER_VIEW())

  const cardWidth = () => {
    const card = trackRef.current?.children[0] as HTMLElement
    if (!card) return 0
    const gap = parseFloat(getComputedStyle(trackRef.current!).columnGap) || 24
    return card.getBoundingClientRect().width + gap
  }

  const go = (i: number) => {
    const max = maxIndex()
    const next = Math.max(0, Math.min(i, max))
    setIndex(next)
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-next * cardWidth()}px)`
    }
  }

  useEffect(() => {
    setDotsCount(maxIndex() + 1)
    const onResize = () => {
      setDotsCount(maxIndex() + 1)
      go(Math.min(index, maxIndex()))
    }
    let rt: ReturnType<typeof setTimeout>
    const handler = () => { clearTimeout(rt); rt = setTimeout(onResize, 150) }
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('resize', handler); clearTimeout(rt) }
  }, [index])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let startX = 0, startIdx = 0, dragging = false

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('a, button')) return
      startX = e.clientX; startIdx = index; dragging = false
      track.setPointerCapture(e.pointerId)
      track.style.transition = 'none'
    }
    const onMove = (e: PointerEvent) => {
      if (!track.hasPointerCapture(e.pointerId)) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) dragging = true
      if (dragging) track.style.transform = `translateX(${-startIdx * cardWidth() + dx}px)`
    }
    const onUp = (e: PointerEvent) => {
      if (!track.hasPointerCapture(e.pointerId)) return
      track.releasePointerCapture(e.pointerId)
      track.style.transition = ''
      if (dragging) {
        const dx = e.clientX - startX
        go(startIdx + (dx < -50 ? 1 : dx > 50 ? -1 : 0))
      }
      dragging = false
    }

    track.addEventListener('pointerdown', onDown)
    track.addEventListener('pointermove', onMove)
    track.addEventListener('pointerup', onUp)
    track.addEventListener('pointercancel', onUp)
    return () => {
      track.removeEventListener('pointerdown', onDown)
      track.removeEventListener('pointermove', onMove)
      track.removeEventListener('pointerup', onUp)
      track.removeEventListener('pointercancel', onUp)
    }
  }, [index])

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal')
    if (!reveals) return
    const check = () => {
      const vh = window.innerHeight
      reveals.forEach(el => {
        if (el.getBoundingClientRect().top < vh * 0.9) el.classList.add('in')
      })
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <section className="services" id="servicios" ref={sectionRef}>
      <div className="sec-head">
        <div className="sec-head__intro">
          <div className="reveal">
            <h2 className="serif">Nuestros <em>servicios</em></h2>
          </div>
          <p className="reveal">
            Técnicas de precisión, productos premium y un acabado que dura. Desliza para explorar todo el menú.
          </p>
        </div>
        <div className="sec-head__actions reveal">
          <div className="carousel__nav">
            <button className="carousel__btn" onClick={() => go(index - 1)} disabled={index <= 0} aria-label="Anterior">←</button>
            <button className="carousel__btn" onClick={() => go(index + 1)} disabled={index >= maxIndex()} aria-label="Siguiente">→</button>
          </div>
          <a href="/servicios" className="btn">Ver todos los servicios <span className="arrow">→</span></a>
        </div>
      </div>

      <div className="carousel">
        <div className="carousel__viewport">
          <div className="carousel__track" ref={trackRef}>
            {list.map(s => (
              <article key={s.id} className="service-card service-card--slide">
                <div className="service-card__media ph">
                  {s.imageUrl && <img src={s.imageUrl} alt={s.name} draggable={false} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
                  <span className="service-card__cat">{s.category}</span>
                  <span className="ph__tag">{s.tag}</span>
                </div>
                <div className="service-card__body">
                  <h3 className="serif">{s.name}</h3>
                  <div className="service-card__meta">
                    {s.price > 0 && (
                      <span className="service-card__price">
                        {s.priceFrom && <small>desde </small>}{fmt(s.price)}
                      </span>
                    )}
                    <span className="service-card__dur">{durStr(s.durationMin)}</span>
                  </div>
                  {s.shortDesc && <p className="service-card__lead">{s.shortDesc}</p>}
                  <div className="service-card__foot">
                    <a className="btn-link" href={`/servicio?id=${s.id}`}>
                      Conocer más <span className="arrow">→</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="carousel__dots">
          {Array.from({ length: dotsCount }).map((_, i) => (
            <button key={i} className={i === index ? 'active' : ''} onClick={() => go(i)} aria-label={`Grupo ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
