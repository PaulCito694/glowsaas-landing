'use client'

import Link from 'next/link'

const links = [
  { label: 'Servicios', href: '/velme/servicios' },
  { label: 'Tienda', href: '/velme/productos' },
  { label: 'Asistente', href: '/#asistente' },
  { label: 'Galería', href: '/#galeria' },
  { label: 'Reserva', href: '/#reserva' },
]

export default function NavigationSubpage() {
  return (
    <header className="nav scrolled">
      <Link href="/" className="nav__logo">
        <span className="wm"><span style={{ fontStyle: 'italic' }}>V</span>ELME</span>
        <span className="wm-sub">Studio</span>
      </Link>

      <nav className="nav__links">
        {links.map(({ label, href }) => (
          <Link key={label} href={href}>{label}</Link>
        ))}
      </nav>

      <Link href="/#reserva" className="nav__cart" style={{ borderRadius: 40 }}>
        Reservar
      </Link>

      <button className="nav__burger" aria-label="Menú">
        <span /><span /><span />
      </button>
    </header>
  )
}
