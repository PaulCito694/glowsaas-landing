'use client'

import { useEffect, useRef } from 'react'
import { fmt } from '../data/velme'
import { useCart } from '../context/CartContext'
import type { LandingProduct } from '@/lib/api'

export default function StoreSection({ products }: { products: LandingProduct[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { addToCart } = useCart()

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
    <section className="shop" id="tienda" ref={sectionRef}>
      <div className="sec-head">
        <div className="sec-head__intro">
          <div className="reveal"><h2 className="serif">La <em>tienda</em></h2></div>
          <p className="reveal">
            Lleva el cuidado del salón a casa. Esenciales seleccionados para mantener tus manos y mirada impecables.
          </p>
        </div>
        <div className="sec-head__actions reveal">
          <a href="/productos" className="btn">Ver todos los productos <span className="arrow">→</span></a>
        </div>
      </div>

      <div className="shop__grid">
        {products.map(p => (
          <article key={p.id} className="product">
            <div className="product__media ph">
              <span className="ph__tag">{p.cat}</span>
              <button className="product__add" onClick={() => addToCart(p)}>
                Agregar · {fmt(p.price)}
              </button>
            </div>
            <div className="product__info">
              <div>
                <h4>{p.name}</h4>
                <div className="cat">{p.cat}</div>
              </div>
              <div className="price">{fmt(p.price)}</div>
            </div>
            <a className="product__view" href={`/producto?id=${p.id}`}>
              Ver producto <span className="arrow">→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
