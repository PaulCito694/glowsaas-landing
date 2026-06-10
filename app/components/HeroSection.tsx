'use client'

import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const layers = heroRef.current?.querySelectorAll<HTMLElement>('.hero__layer')
    if (!layers) return

    const onScroll = () => {
      const y = window.scrollY
      if (y > window.innerHeight * 1.2) return
      layers.forEach(l => {
        const sp = parseFloat(l.dataset.speed || '0')
        const rot = parseFloat(l.dataset.rot || '0')
        l.style.transform = `translate3d(0,${y * sp}px,${sp * 120}px) rotate(${y * rot}deg)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onPointer = (e: PointerEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth || '0')
        l.style.marginLeft = `${cx * d}px`
        l.style.marginTop = `${cy * d}px`
      })
    }
    heroRef.current?.addEventListener('pointermove', onPointer)

    return () => {
      window.removeEventListener('scroll', onScroll)
      heroRef.current?.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <section className="hero" id="inicio" ref={heroRef}>
      <div className="hero__bg">
        <div className="hero__layer layer-arc" data-speed="0.12" data-rot="0.005" data-depth="22" />
        <div className="hero__layer layer-arc b" data-speed="0.20" data-rot="-0.01" data-depth="40" />
        <div className="hero__layer layer-photo ph" data-speed="0.28" data-depth="30">
          <span className="ph__tag">retrato · pestañas</span>
        </div>
        <div className="hero__layer layer-photo b ph" data-speed="0.40" data-depth="55">
          <span className="ph__tag">detalle · nail art</span>
        </div>
        <div className="hero__layer layer-dot dot-1" data-speed="0.5" data-depth="60" />
        <div className="hero__layer layer-dot dot-2" data-speed="0.35" data-depth="44" />
        <div className="hero__layer layer-dot dot-3" data-speed="0.6" data-depth="70" />
      </div>

      <div className="hero__content">
        <p className="eyebrow reveal">Salón premium · Uñas &amp; Pestañas · Miraflores, Lima</p>
        <div className="hero__sign">
          <h1 className="wordmark hero__word">
            <span className="vee">V</span>ELME
          </h1>
          <div className="wordmark__sub">
            <span className="ln" /><span className="txt">Studio</span><span className="ln" />
          </div>
        </div>
        <p className="hero__tag">
          Donde cada detalle se diseña para ti. Manos y miradas que hablan de lujo, hechas a tu medida.
        </p>
        <div className="hero__cta">
          <a href="#reserva" className="btn btn--lg">Reserva tu cita <span className="arrow">→</span></a>
          <span className="hero__meta">Atención con cita previa</span>
        </div>
      </div>

      <div className="hero__scroll">
        <span>Scroll</span>
        <span className="ln" />
      </div>
    </section>
  )
}
