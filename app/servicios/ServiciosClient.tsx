'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '../data/velme'
import { durStr, type Service, type CategoryNode } from '@/lib/api'

export default function ServiciosClient({ services, categories }: { services: Service[]; categories: CategoryNode[] }) {
  const [active, setActive] = useState('Todos')

  const filterMap = new Map<string, string[]>()
  categories.forEach(p => {
    filterMap.set(p.name, [p.name, ...p.children.map(c => c.name)])
  })

  const filters = ['Todos', ...categories.map(c => c.name)]

  const list = active === 'Todos'
    ? services
    : services.filter(s => filterMap.get(active)?.includes(s.category) || filterMap.get(active)?.includes(s.parentCat))

  return (
    <main className="listing">
      <div className="listing__head">
        <p className="eyebrow">Velme Studio · Menú completo</p>
        <h1 className="serif">Nuestros <em>servicios</em></h1>
        <p>Cada servicio se diseña a tu medida con técnica de precisión y producto premium. Filtra por especialidad y conoce el detalle de cada uno.</p>
        <div className="listing__filters">
          {filters.map(f => (
            <button key={f} className={active === f ? 'active' : ''} onClick={() => setActive(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="listing__grid">
        {list.map(s => (
          <article key={s.id} className="service-card">
            <div className="service-card__media ph">
              {s.imageUrl && <img src={s.imageUrl} alt={s.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
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
                <Link className="btn-link" href={`/servicio?id=${s.id}`}>
                  Conocer más <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
