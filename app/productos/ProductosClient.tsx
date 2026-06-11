'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '../data/velme'
import type { LandingProduct, CategoryNode } from '@/lib/api'

export default function ProductosClient({ products, categories }: { products: LandingProduct[]; categories: CategoryNode[] }) {
  const [active, setActive] = useState('Todos')

  // Build a map: parent name → [parent name, ...child names] for filtering
  const filterMap = new Map<string, string[]>()
  categories.forEach(p => {
    filterMap.set(p.name, [p.name, ...p.children.map(c => c.name)])
  })

  const filters = ['Todos', ...categories.map(c => c.name)]

  const list = active === 'Todos'
    ? products
    : products.filter(p => filterMap.get(active)?.includes(p.cat) || filterMap.get(active)?.includes(p.parentCat))

  return (
    <main className="listing">
      <div className="listing__head">
        <p className="eyebrow">Velme Studio · Tienda</p>
        <h1 className="serif">La <em>tienda</em></h1>
        <p>El cuidado del salón, en casa. Esenciales seleccionados por nuestro equipo para prolongar tus resultados.</p>
        <div className="listing__filters">
          {filters.map(f => (
            <button key={f} className={active === f ? 'active' : ''} onClick={() => setActive(f)}>
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
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
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
