'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VELME_PRODUCTS, fmt } from '../data/velme'

const FILTERS = ['Todos', 'Uñas', 'Pestañas', 'Cuidado', 'Edición'] as const
type Filter = typeof FILTERS[number]

export default function ProductosClient() {
  const [active, setActive] = useState<Filter>('Todos')

  const list = active === 'Todos'
    ? VELME_PRODUCTS
    : VELME_PRODUCTS.filter(p => p.cat === active)

  return (
    <main className="listing">
      <div className="listing__head">
        <p className="eyebrow">Velme Studio · Tienda</p>
        <h1 className="serif">La <em>tienda</em></h1>
        <p>El cuidado del salón, en casa. Esenciales seleccionados por nuestro equipo para prolongar tus resultados.</p>
        <div className="listing__filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={active === f ? 'active' : ''}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="listing__grid products">
        {list.length ? list.map(p => (
          <article key={p.id} className="product">
            <Link href={`/producto?id=${p.id}`} style={{ display: 'block' }}>
              <div className="product__media ph">
                <span className="ph__tag">{p.cat}</span>
              </div>
            </Link>
            <div className="product__info">
              <div>
                <h4>{p.name}</h4>
                <div className="cat">{p.cat}</div>
              </div>
              <div className="price">{fmt(p.price)}</div>
            </div>
            <Link className="product__view" href={`/producto?id=${p.id}`}>
              Ver producto <span className="arrow">→</span>
            </Link>
          </article>
        )) : (
          <p style={{ color: 'var(--muted)' }}>No hay productos en esta categoría.</p>
        )}
      </div>
    </main>
  )
}
