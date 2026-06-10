'use client'

import { useEffect, useRef, useState } from 'react'
import {
  slotsForDate, isSlotBooked, isDayOpen, fetchAvailability, createAppointment,
  type DayHours, type CompanyInfo, type BookedSlot,
} from '@/lib/api'
import { ymd } from '../data/velme'

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DOW = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

const DEFAULT_WA = 'https://wa.me/51999888777'
const DEFAULT_EMAIL = 'hola@velmestudio.pe'

interface Props {
  company: CompanyInfo | null
  hours: DayHours[]
}

export default function BookingSection({ company, hours }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewY, setViewY] = useState(today.getFullYear())
  const [viewM, setViewM] = useState(today.getMonth())
  const [selDate, setSelDate] = useState<string | null>(null)
  const [selOpen, setSelOpen] = useState(false)
  const [selSlot, setSelSlot] = useState<string | null>(null)
  const [booked, setBooked] = useState<BookedSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [chosenSvc, setChosenSvc] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const waLink = company?.phone
    ? `https://wa.me/${company.phone.replace(/\D/g, '')}`
    : DEFAULT_WA
  const email = company?.email ?? DEFAULT_EMAIL

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

  const pickDay = async (ds: string, open: boolean) => {
    setSelDate(ds)
    setSelOpen(open)
    setSelSlot(null)
    setBooked([])
    if (!open) return
    setLoadingSlots(true)
    const data = await fetchAvailability(ds)
    setBooked(data)
    setLoadingSlots(false)
  }

  const renderCalDays = () => {
    const first = new Date(viewY, viewM, 1)
    const startDow = first.getDay()
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate()
    const cells = []

    for (let i = 0; i < startDow; i++) {
      cells.push(<div key={`e${i}`} className="cal__day is-empty" />)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewY, viewM, d)
      const ds = ymd(date)
      const isPast = date < today
      const isToday = date.getTime() === today.getTime()
      const open = isDayOpen(date, hours)

      let cls = 'cal__day'
      if (isPast) cls += ' is-past'
      else if (!open) cls += ' is-closed'
      else cls += ' is-open is-some'
      if (isToday) cls += ' is-today'
      if (selDate === ds) cls += ' selected'

      cells.push(
        <button
          key={ds}
          type="button"
          className={cls}
          onClick={() => !isPast && pickDay(ds, open)}
        >
          {d}
          <span className="dot" />
        </button>
      )
    }
    return cells
  }

  const selectedDateObj = selDate ? (() => {
    const [y, m, d] = selDate.split('-').map(Number)
    return new Date(y, m - 1, d)
  })() : null

  const slots = selectedDateObj && selOpen ? slotsForDate(selectedDateObj, hours) : []

  const prevDisabled = viewY === today.getFullYear() && viewM <= today.getMonth()
  const prevMonth = () => {
    if (viewM === 0) { setViewM(11); setViewY(y => y - 1) } else setViewM(m => m - 1)
  }
  const nextMonth = () => {
    if (viewM === 11) { setViewM(0); setViewY(y => y + 1) } else setViewM(m => m + 1)
  }

  const [, sm, sd] = selDate ? selDate.split('-').map(Number) : [0, 0, 0]

  const summary = selDate && selSlot
    ? `Reservarás: ${sd} de ${MONTHS[sm - 1]} a las ${selSlot}${chosenSvc ? ` · ${chosenSvc}` : ''}`
    : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selDate || !selSlot || submitting) return
    setSubmitting(true)
    setSubmitError(false)

    const result = await createAppointment({
      date: selDate,
      start: selSlot,
      serviceId: '',
      customerName: name,
      customerPhone: phone || undefined,
      notes: chosenSvc || undefined,
    })

    setSubmitting(false)
    if (result) {
      setSubmitted(true)
    } else {
      setSubmitError(true)
    }
  }

  return (
    <section className="booking" id="reserva" ref={sectionRef}>
      <div className="booking__inner">
        <div className="booking__copy">
          <p className="eyebrow">Reserva</p>
          <div className="reveal"><h2 className="serif">Tu cita <em>te espera</em></h2></div>
          <p className="reveal">
            Elige tu servicio y horario. Confirmamos por WhatsApp con un 20% de adelanto para asegurar tu espacio.
          </p>
          <div className="booking__list reveal">
            <div><span className="n serif">1</span><span>Cuéntanos qué buscas</span></div>
            <div><span className="n serif">2</span><span>Elige día y hora</span></div>
            <div><span className="n serif">3</span><span>Recibe tu confirmación al instante</span></div>
          </div>
        </div>

        <div className="form reveal">
          {submitted ? (
            <div className="form__ok">
              <div className="mark">✓</div>
              <h3 className="serif">¡Reserva solicitada!</h3>
              <p>
                Tu cita para el <strong>{sd} de {MONTHS[sm - 1]} a las {selSlot}</strong> quedó <strong>solicitada</strong>.
                Te escribiremos por WhatsApp para confirmarla.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Servicio de interés</label>
                <div className="chips-select">
                  {['Uñas', 'Pestañas', 'Ambos', 'No estoy segura'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={chosenSvc === opt ? 'active' : ''}
                      onClick={() => setChosenSvc(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Elige una fecha</label>
                <div className="cal">
                  <div className="cal__head">
                    <div className="cal__month">{MONTHS[viewM]} {viewY}</div>
                    <div className="cal__nav">
                      <button type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Mes anterior">←</button>
                      <button type="button" onClick={nextMonth} aria-label="Mes siguiente">→</button>
                    </div>
                  </div>
                  <div className="cal__dow">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                  </div>
                  <div className="cal__grid">{renderCalDays()}</div>
                  <div className="cal__legend">
                    <span><i className="some" /> Con disponibilidad</span>
                    <span><i className="closed" /> No laborable</span>
                  </div>
                </div>
              </div>

              {selDate && selOpen && (
                <div className="slots">
                  <div className="slots__head">
                    <h4>Horarios</h4>
                    <span className="day">
                      {selectedDateObj && `${DOW[selectedDateObj.getDay()]} ${sd} de ${MONTHS[sm - 1]}`}
                    </span>
                  </div>
                  {loadingSlots ? (
                    <div style={{ color: 'var(--muted)', fontSize: 14, padding: '12px 0' }}>Cargando…</div>
                  ) : (
                    <div className="slots__grid">
                      {slots.map(s => {
                        const busy = isSlotBooked(s, booked)
                        return busy ? (
                          <div key={s} className="slot busy">{s}<small>Ocupado</small></div>
                        ) : (
                          <button
                            key={s}
                            type="button"
                            className={`slot free${selSlot === s ? ' selected' : ''}`}
                            onClick={() => setSelSlot(s)}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {selDate && !selOpen && (
                <div className="offhours">
                  <h4>¿Buscas otro día u horario?</h4>
                  <p>
                    El {selectedDateObj && DOW[selectedDateObj.getDay()]} no atendemos en agenda regular, pero podemos coordinar una cita especial directamente con la dueña.
                  </p>
                  <div className="offhours__cta">
                    <a className="wa" href={waLink} target="_blank" rel="noopener">Coordinar por WhatsApp →</a>
                    <a className="ghost" href={`mailto:${email}`}>Escribir un correo</a>
                  </div>
                </div>
              )}

              {summary && (
                <div className="booking__summary"><b>{summary}</b></div>
              )}
              {!summary && selDate && !selSlot && selOpen && (
                <div className="booking__summary">Selecciona un horario disponible.</div>
              )}

              <div className="field" style={{ marginTop: 18 }}>
                <label>Nombre completo</label>
                <input
                  type="text" required
                  placeholder="Tu nombre"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input
                  type="tel" required
                  placeholder="+51 9XX XXX XXX"
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
              </div>

              {submitError && (
                <p style={{ color: 'var(--neg)', fontSize: 13, marginBottom: 8 }}>
                  Hubo un error al enviar. Intenta por WhatsApp.
                </p>
              )}

              <button type="submit" className="btn btn--solid btn--lg" disabled={submitting}>
                {submitting ? 'Enviando…' : <>Solicitar reserva <span className="arrow">→</span></>}
              </button>
              <p className="form__note">
                Tu cita queda en estado <b>"solicitada"</b>. Te confirmamos por WhatsApp y coordinamos el 20% de adelanto.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
