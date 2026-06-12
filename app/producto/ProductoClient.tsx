'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '../data/velme'
import { useCart } from '../context/CartContext'
import type { LandingProduct } from '@/lib/api'

export default function ProductoClient({
  product,
  related,
}: {
  product: LandingProduct
  related: LandingProduct[]
}) {
  const p = product
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAdd() {
    for (let i = 0; i < qty; i++) addToCart(p)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <main className="detail">
        <div className="crumb">
          <Link href="/">Inicio</Link>
          <span className="sep">/</span>
          <Link href="/productos">Tienda</Link>
          <span className="sep">/</span>
          <span>{p.name}</span>
        </div>

        <div className="detail__grid">
          <div className="detail__media">
            <div className="ph">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
              <span className="ph__tag">{p.cat}</span>
            </div>
          </div>

          <div className="detail__info">
            <span className="detail__cat">{p.cat}</span>
            <h1 className="serif">{p.name}</h1>
            <div className="detail__meta">
              <span className="detail__price">{fmt(p.price)}</span>
            </div>
            {p.short && <p className="detail__lead">{p.short}</p>}
            {p.long && p.long.length > 0 && (
              <div className="detail__body">
                {p.long.map((t, i) => <p key={i}>{t}</p>)}
              </div>
            )}

            <div className="detail__cta">
              <div className="detail__qty">
                <button aria-label="Restar" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button aria-label="Sumar" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className="btn btn--solid btn--lg" onClick={handleAdd}>
                {added ? 'Agregado ✓' : <><span>Agregar al carrito</span> <span className="arrow">→</span></>}
              </button>
            </div>

            <div className="detail__block">
              <h4>Envíos &amp; recojo</h4>
              <p className="detail__care">
                Envío a todo Lima en 24–48 h. Recojo gratuito en nuestro estudio de Miraflores.
              </p>
            </div>
          </div>
        </div>
      </main>

      {related.length > 0 && (
        <section className="related">
          <h3 className="serif">También te <em>puede gustar</em></h3>
          <div className="related__grid">
            {related.map(r => (
              <article key={r.id} className="product">
                <Link href={`/producto?id=${r.id}`} style={{ display: 'block' }}>
                  <div className="product__media ph">
                    {r.imageUrl && <img src={r.imageUrl} alt={r.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
                    <span className="ph__tag">{r.cat}</span>
                  </div>
                </Link>
                <div className="product__info">
                  <div>
                    <h4>{r.name}</h4>
                    <div className="cat">{r.cat}</div>
                  </div>
                  <div className="price">{fmt(r.price)}</div>
                </div>
                <Link className="product__view" href={`/producto?id=${r.id}`}>
                  Ver producto <span className="arrow">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
