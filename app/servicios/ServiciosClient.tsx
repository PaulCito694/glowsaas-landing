'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '../data/velme'
import { durStr, type Service } from '@/lib/api'

const FILTERS = ['Todos', 'Uñas', 'Pestañas'] as const
type Filter = typeof FILTERS[number]

export default function ServiciosClient({ services }: { services: Service[] }) {
  const [active, setActive] = useState<Filter>('Todos')

  const list = active === 'Todos'
    ? services
    : services.filter(s => s.category === active)

  return (
    <main className="listing">
      <div className="listing__head">
        <p className="eyebrow">Velme Studio · Menú completo</p>
        <h1 className="serif">Nuestros <em>servicios</em></h1>
        <p>Cada servicio se diseña a tu medida con técnica de precisión y producto premium. Filtra por especialidad y conoce el detalle de cada uno.</p>
        <div className="listing__filters">
          {FILTERS.map(f => (
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
                <span className="service-card__price">
                  {s.priceFrom && <small>desde </small>}{fmt(s.price)}
                </span>
                <span className="service-card__dur">{durStr(s.durationMin)}</span>
              </div>
              <p className="service-card__lead">{s.shortDesc}</p>
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
