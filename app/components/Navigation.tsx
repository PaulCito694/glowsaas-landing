'use client'

import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Tienda', href: '#tienda' },
  { label: 'Asistente', href: '#asistente' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Reserva', href: '#reserva' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const { count, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function smoothTo(id: string) {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#inicio" className="nav__logo">
        <span className="wm"><span style={{ fontStyle: 'italic' }}>V</span>ELME</span>
        <span className="wm-sub">Studio</span>
      </a>

      <nav className="nav__links">
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={e => { e.preventDefault(); smoothTo(href) }}
          >
            {label}
          </a>
        ))}
      </nav>

      <button
        className={`nav__cart${count > 0 ? ' has-items' : ''}`}
        onClick={openCart}
      >
        <span className="dot" />
        Carrito · <span>{count}</span>
      </button>

      <button className="nav__burger" aria-label="Menú">
        <span /><span /><span />
      </button>
    </header>
  )
}
