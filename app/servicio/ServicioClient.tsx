'use client'

import Link from 'next/link'
import { fmt } from '../data/velme'
import { durStr, type Service } from '@/lib/api'

interface Props {
  service: Service | null
  related: Service[]
}

export default function ServicioClient({ service, related }: Props) {
  if (!service) {
    return (
      <main className="detail">
        <p style={{ padding: '4rem 2rem', color: 'var(--muted)' }}>Servicio no encontrado.</p>
      </main>
    )
  }

  return (
    <>
      <main className="detail">
        <div className="crumb">
          <Link href="/">Inicio</Link>
          <span className="sep">/</span>
          <Link href="/servicios">Servicios</Link>
          <span className="sep">/</span>
          <span>{service.name}</span>
        </div>

        <div className="detail__grid">
          <div className="detail__media">
            <div className="ph">
              {service.imageUrl && <img src={service.imageUrl} alt={service.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
              <span className="ph__tag">{service.tag}</span>
            </div>
          </div>

          <div className="detail__info">
            <span className="detail__cat">{service.category}</span>
            <h1 className="serif">{service.name}</h1>
            <div className="detail__meta">
              {service.price > 0 && (
                <span className="detail__price">
                  {service.priceFrom && <small>desde </small>}{fmt(service.price)}
                </span>
              )}
              <span className="detail__dur">{durStr(service.durationMin)}</span>
            </div>
            <p className="detail__lead">{service.shortDesc}</p>
            <div className="detail__body">
              {service.longDesc.map((t, i) => <p key={i}>{t}</p>)}
            </div>

            <div className="detail__block">
              <h4>Incluye</h4>
              <ul>
                {service.serviceIncludes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <div className="detail__block">
              <h4>Cuidado posterior</h4>
              <p className="detail__care">{service.care}</p>
            </div>

            <div className="detail__cta">
              <Link href="/#reserva" className="btn btn--solid btn--lg">
                Reservar este servicio <span className="arrow">→</span>
              </Link>
              <Link href="/servicios" className="btn">Ver todos</Link>
            </div>
          </div>
        </div>
      </main>

      {related.length > 0 && (
        <section className="related">
          <h3 className="serif">Otros <em>servicios</em></h3>
          <div className="related__grid">
            {related.map(r => (
              <article key={r.id} className="service-card">
                <div className="service-card__media ph">
                  {r.imageUrl && <img src={r.imageUrl} alt={r.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
                  <span className="service-card__cat">{r.category}</span>
                  <span className="ph__tag">{r.tag}</span>
                </div>
                <div className="service-card__body">
                  <h3 className="serif">{r.name}</h3>
                  <div className="service-card__meta">
                    <span className="service-card__price">
                      {r.priceFrom && <small>desde </small>}{fmt(r.price)}
                    </span>
                    <span className="service-card__dur">{durStr(r.durationMin)}</span>
                  </div>
                  <p className="service-card__lead">{r.shortDesc}</p>
                  <div className="service-card__foot">
                    <Link className="btn-link" href={`/servicio?id=${r.id}`}>
                      Conocer más <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
