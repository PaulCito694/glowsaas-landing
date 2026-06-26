'use client'

import { useEffect, useRef, useState } from 'react'
import {
  slotsForDate, isSlotBooked, isDayOpen, fetchAvailability, createAppointment, uploadProof,
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

type Step = 'form' | 'yape' | 'done'

export default function BookingSection({ company, hours }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [step, setStep] = useState<Step>('form')

  const [yapeFile, setYapeFile] = useState<File | null>(null)
  const [yapePreview, setYapePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  function handleYapeFile(file: File) {
    setYapeFile(file)
    const reader = new FileReader()
    reader.onload = e => setYapePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selDate || !selSlot || !name.trim() || !phone.trim()) return
    setSubmitError('')
    setStep('yape')
    window.scrollTo({ top: sectionRef.current?.offsetTop ?? 0, behavior: 'smooth' })
  }

  const handleYapeSubmit = async () => {
    if (!yapeFile || uploading) return
    setUploading(true)
    setSubmitError('')

    const yapeUrl = await uploadProof(yapeFile)
    if (!yapeUrl) {
      setUploading(false)
      setSubmitError('Error al subir el comprobante. Intenta de nuevo.')
      return
    }

    const result = await createAppointment({
      date: selDate!,
      start: selSlot!,
      serviceId: '',
      customerName: name.trim(),
      customerPhone: phone.trim(),
      notes: chosenSvc || undefined,
      yapeUrl,
    })

    setUploading(false)
    if (result) {
      setStep('done')
    } else {
      setSubmitError('Error al crear la reserva. Intenta por WhatsApp.')
    }
  }

  return (
    <section className="booking" id="reserva" ref={sectionRef}>
      <div className="booking__inner">
        <div className="booking__copy">
          <p className="eyebrow">Reserva</p>
          <div className="reveal"><h2 className="serif">Tu cita <em>te espera</em></h2></div>
          <p className="reveal">
            Elige tu servicio y horario. Asegura tu espacio con un adelanto de S/ 5 via Yape.
          </p>
          <div className="booking__list reveal">
            <div><span className={`n serif${step === 'form' ? ' active' : ''}`}>1</span><span>Elige día y hora</span></div>
            <div><span className={`n serif${step === 'yape' ? ' active' : ''}`}>2</span><span>Adjunta tu Yape (S/ 5)</span></div>
            <div><span className={`n serif${step === 'done' ? ' active' : ''}`}>3</span><span>Confirmación al instante</span></div>
          </div>
        </div>

        <div className="form reveal">
          {step === 'done' ? (
            <div className="form__ok">
              <div className="mark">✓</div>
              <h3 className="serif">¡Reserva confirmada!</h3>
              <p>
                Tu cita para el <strong>{sd} de {MONTHS[sm - 1]} a las {selSlot}</strong> está <strong>reservada</strong>.
                Te escribiremos por WhatsApp para confirmarla.
              </p>
            </div>

          ) : step === 'yape' ? (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 className="serif" style={{ fontSize: 22, marginBottom: 6 }}>Adelanto de S/ 5 via Yape</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Yapea <strong>S/ 5</strong> para reservar tu espacio y sube el comprobante aquí.
                  {company?.phone && (
                    <> Número Yape: <strong>{company.phone}</strong>.</>
                  )}
                </p>
              </div>

              <div
                className="yape-drop"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleYapeFile(file)
                }}
                style={{
                  border: '2px dashed var(--line)',
                  borderRadius: 12,
                  padding: yapePreview ? 0 : '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  marginBottom: 20,
                  transition: 'border-color .2s',
                }}
              >
                {yapePreview ? (
                  <img
                    src={yapePreview}
                    alt="Comprobante Yape"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>📸</p>
                    <p style={{ fontSize: 14, color: 'var(--muted)' }}>Toca para subir o arrastra la captura de pantalla</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>JPG, PNG o HEIC</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleYapeFile(e.target.files[0])}
              />

              {yapePreview && (
                <button
                  type="button"
                  onClick={() => { setYapeFile(null); setYapePreview(null) }}
                  style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'block' }}
                >
                  Cambiar imagen
                </button>
              )}

              {submitError && (
                <p style={{ color: 'var(--neg)', fontSize: 13, marginBottom: 12 }}>{submitError}</p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => { setStep('form'); setSubmitError('') }}
                  disabled={uploading}
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  className="btn btn--solid btn--lg"
                  onClick={handleYapeSubmit}
                  disabled={!yapeFile || uploading}
                  style={{ flex: 1 }}
                >
                  {uploading ? 'Reservando…' : <>Confirmar reserva <span className="arrow">→</span></>}
                </button>
              </div>
              <p className="form__note" style={{ marginTop: 12 }}>
                Recibirás confirmación por WhatsApp en minutos.
              </p>
            </div>

          ) : (
            <form onSubmit={handleFormSubmit}>
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

              <button
                type="submit"
                className="btn btn--solid btn--lg"
                disabled={!selDate || !selSlot || !name.trim() || !phone.trim()}
              >
                Continuar <span className="arrow">→</span>
              </button>
              <p className="form__note">
                En el siguiente paso adjuntas tu Yape de <b>S/ 5</b> para asegurar el horario.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
