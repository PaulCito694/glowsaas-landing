'use client'

import { useEffect, useRef, useState } from 'react'
import {
  slotsForDate, isSlotBooked, isDayOpen, fetchAvailability,
  createAppointment, uploadProof, chatWithAssistant,
  type DayHours, type CompanyInfo,
} from '@/lib/api'
import { ymd } from '../data/velme'

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DOW_ES    = ['dom','lun','mar','mié','jue','vie','sáb']

type Phase = 'greeting' | 'service' | 'date' | 'time' | 'name' | 'phone' | 'yape' | 'done'
type Msg   = { id: number; role: 'bot' | 'user'; text: string; waBtn?: string }
type Chip  = { label: string; value: string; say?: string }

interface Props { company: CompanyInfo | null; hours: DayHours[] }

let _id = 0
const uid = () => ++_id

function fmtDate(ds: string) {
  const [, m, d] = ds.split('-').map(Number)
  return `${d} de ${MONTHS_ES[m - 1]}`
}

function nextOpenDays(hours: DayHours[], n = 8) {
  const out: { ds: string; label: string }[] = []
  const base = new Date(); base.setHours(0, 0, 0, 0)
  for (let i = 0; i < 60 && out.length < n; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i)
    if (isDayOpen(d, hours)) {
      out.push({
        ds: ymd(d),
        label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana'
          : `${DOW_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`,
      })
    }
  }
  return out
}

export default function ChatBookingSection({ company, hours }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  const [msgs,       setMsgs]       = useState<Msg[]>([])
  const [chips,      setChips]      = useState<Chip[]>([])
  const [phase,      setPhase]      = useState<Phase>('greeting')
  const [txt,        setTxt]        = useState('')
  const [typing,     setTyping]     = useState(false)
  const [yapeFile,   setYapeFile]   = useState<File | null>(null)
  const [yapeThumb,  setYapeThumb]  = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const bk   = useRef({ service: '', date: '', slot: '', name: '', phone: '' })
  const hist = useRef<{ role: 'user' | 'assistant'; content: string }[]>([])

  const push = (role: 'bot' | 'user', text: string, waBtn?: string) =>
    setMsgs(m => [...m, { id: uid(), role, text, waBtn }])

  const bot = (text: string, next: Chip[] = [], ms = 500) => {
    setTyping(true); setChips([])
    setTimeout(() => { setTyping(false); push('bot', text); setChips(next) }, ms)
  }

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [msgs, typing, chips, showUpload])

  useEffect(() => {
    const sec = sectionRef.current; if (!sec) return
    const els = sec.querySelectorAll('.reveal')
    const fn = () => {
      const vh = window.innerHeight
      els.forEach(el => { if (el.getBoundingClientRect().top < vh * 0.88) el.classList.add('in') })
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Mount greeting
  useEffect(() => {
    setTimeout(() => {
      push('bot', '¡Hola! 👋 Soy Thomy, tu asistente de Velme Studio. ¿En qué puedo ayudarte hoy?')
      setChips([
        { label: '📅 Reservar mi cita',  value: '__book__', say: 'Quiero reservar una cita' },
        { label: '💬 Tengo una pregunta', value: '__qa__',   say: 'Tengo una pregunta' },
      ])
    }, 300)
  }, [])

  // ── Navigation helpers ────────────────────────────────────────
  const toService = () => {
    setPhase('service')
    bot('¡Perfecto! ¿Qué servicio te interesa?', [
      { label: '💅 Uñas',            value: 'Uñas',            say: 'Uñas' },
      { label: '✨ Pestañas',         value: 'Pestañas',        say: 'Pestañas' },
      { label: '💅✨ Ambos',          value: 'Uñas y Pestañas', say: 'Quiero ambos — uñas y pestañas' },
      { label: '🤔 Ayúdame a elegir', value: '__help__',        say: 'No sé cuál elegir, ¿me ayudas?' },
    ])
  }

  const toDate = (svc: string) => {
    bk.current.service = svc
    setPhase('date')
    const days = nextOpenDays(hours)
    bot(
      `¡${svc}! Excelente elección 💫 ¿Para qué día quieres tu cita?`,
      days.map(d => ({ label: d.label, value: d.ds, say: d.label === 'Hoy' ? 'Hoy mismo' : d.label === 'Mañana' ? 'Mañana' : d.label }))
    )
  }

  const toSlots = async (ds: string) => {
    bk.current.date = ds
    setTyping(true); setChips([])
    const booked = await fetchAvailability(ds)
    const [y, m, d] = ds.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const now     = new Date()
    const isToday = ymd(now) === ds
    const slots   = slotsForDate(dateObj, hours).filter(s => {
      if (isSlotBooked(s, booked)) return false
      if (isToday) {
        const [hh, mm] = s.split(':').map(Number)
        return hh * 60 + mm > now.getHours() * 60 + now.getMinutes() + 30
      }
      return true
    })
    setTyping(false)
    if (!slots.length) {
      push('bot', `Lo siento, ese día ya no tiene horarios libres. ¿Eliges otro?`)
      setChips(nextOpenDays(hours).map(d => ({ label: d.label, value: d.ds, say: d.label })))
      setPhase('date')
      return
    }
    push('bot', `Para el ${fmtDate(ds)}, estos horarios están disponibles:`)
    setChips(slots.map(s => ({ label: s, value: s, say: `A las ${s}` })))
    setPhase('time')
  }

  const toName = (slot: string) => {
    bk.current.slot = slot
    setPhase('name')
    bot(`¡${slot}, anotado! 🎉 Ya casi terminamos. ¿Cuál es tu nombre completo?`)
    setTimeout(() => inputRef.current?.focus(), 600)
  }

  const toPhone = (name: string) => {
    bk.current.name = name
    setPhase('phone')
    bot(`Encantada, ${name}! ¿Y tu número de WhatsApp? Te escribiremos para confirmar.`)
    setTimeout(() => inputRef.current?.focus(), 600)
  }

  const toYape = (phone: string) => {
    bk.current.phone = phone
    setPhase('yape')
    const num = company?.phone ?? '—'
    bot(
      `¡Todo listo, ${bk.current.name}! 🔒 Solo falta asegurar tu espacio.\n\nHaz un Yape de S/ 5 al número ${num} y sube aquí la captura de pantalla:`,
      [], 500
    )
    setTimeout(() => setShowUpload(true), 1050)
  }

  // ── Chip click ────────────────────────────────────────────────
  const onChip = async (c: Chip) => {
    setChips([])
    push('user', c.say ?? c.label)

    if (c.value === '__book__') { toService(); return }
    if (c.value === '__qa__') {
      setPhase('greeting')
      bot('¡Claro! ¿Cuál es tu consulta?')
      setTimeout(() => inputRef.current?.focus(), 600)
      return
    }
    if (c.value === '__help__') {
      setTyping(true)
      const q = '¿Me puedes recomendar qué elegir entre servicios de uñas y pestañas del estudio?'
      const h: { role: 'user' | 'assistant'; content: string }[] = [{ role: 'user', content: q }]
      const reply = await chatWithAssistant(h)
      hist.current = [{ role: 'assistant', content: reply }]
      setTyping(false)
      push('bot', reply)
      setChips([
        { label: '💅 Uñas',   value: 'Uñas',            say: 'Uñas' },
        { label: '✨ Pestañas', value: 'Pestañas',        say: 'Pestañas' },
        { label: '💅✨ Ambos', value: 'Uñas y Pestañas', say: 'Ambos' },
      ])
      return
    }

    if (phase === 'service') { toDate(c.value); return }
    if (phase === 'date')    { toSlots(c.value); return }
    if (phase === 'time')    { toName(c.value); return }
  }

  // ── Text send ─────────────────────────────────────────────────
  const onSend = async () => {
    const text = txt.trim(); if (!text) return
    setTxt(''); setChips([])
    push('user', text)

    if (phase === 'name')  { toPhone(text); return }
    if (phase === 'phone') { toYape(text);  return }

    // Q&A via Claude
    setTyping(true)
    const next = [...hist.current, { role: 'user' as const, content: text }]
    const reply = await chatWithAssistant(next)
    hist.current = [...next, { role: 'assistant', content: reply }]
    setTyping(false)
    push('bot', reply)
    if (!['name', 'phone', 'yape', 'done'].includes(phase)) {
      setChips([{ label: '📅 Reservar mi cita', value: '__book__', say: 'Quiero reservar una cita' }])
    }
  }

  // ── Yape ─────────────────────────────────────────────────────
  const pickYape = (file: File) => {
    setYapeFile(file)
    const r = new FileReader()
    r.onload = e => setYapeThumb(e.target?.result as string)
    r.readAsDataURL(file)
  }

  const confirmYape = async () => {
    if (!yapeFile || uploading) return
    setUploading(true)
    setShowUpload(false)
    push('user', '📸 Comprobante Yape enviado')
    setTyping(true)

    const yapeUrl = await uploadProof(yapeFile)
    if (!yapeUrl) {
      setTyping(false); setUploading(false)
      push('bot', 'Ups, no pude subir la imagen. ¿Puedes intentarlo de nuevo?')
      setShowUpload(true)
      return
    }

    const b  = bk.current
    const ok = await createAppointment({
      date: b.date, start: b.slot, serviceId: '',
      customerName: b.name, customerPhone: b.phone,
      notes: b.service, yapeUrl,
    })
    setTyping(false); setUploading(false)

    if (ok) {
      setPhase('done')
      const waPhone = (company?.phone ?? '').replace(/\D/g, '')
      const waText  = encodeURIComponent(`Hola Thomy, acabo de reservar mi cita 💅`)
      const waBtn   = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : undefined
      push(
        'bot',
        `⏳ ¡Solicitud recibida, ${b.name}!\n\n📋 ${b.service}\n📅 ${fmtDate(b.date)} · ${b.slot}\n\nTu cita queda en revisión. Para recibir la confirmación en tu WhatsApp, toca el botón 👇`,
        waBtn,
      )
    } else {
      push('bot', 'Hubo un error al procesar tu reserva. Por favor escríbenos por WhatsApp y te ayudamos de inmediato.')
      setShowUpload(true)
    }
  }

  // ── UI helpers ────────────────────────────────────────────────
  const step = ({ greeting:0, service:1, date:2, time:2, name:3, phone:3, yape:4, done:5 } as Record<Phase,number>)[phase] ?? 0
  const inputOff = ['date','time','yape','done'].includes(phase) || typing || uploading
  const inputPH  = phase === 'name'  ? 'Tu nombre completo...'
                 : phase === 'phone' ? 'Tu número de WhatsApp...'
                 : inputOff          ? 'Elige una opción de arriba 👆'
                 : 'Escribe tu consulta...'

  return (
    <section className="cbook" id="reserva" ref={sectionRef}>
      <div className="cbook__inner">

        {/* Left — copy + progress */}
        <div className="cbook__copy reveal">
          <p className="eyebrow">Reserva tu cita</p>
          <h2 className="serif">Agenda <em>con Thomy</em></h2>
          <p>Nuestro asistente te guía paso a paso: solo responde las preguntas y tu cita quedará lista en minutos.</p>
          <ul className="cbook__steps">
            {['Elige tu servicio','Fecha y hora','Tus datos','Adelanto S/ 5 Yape'].map((label, i) => (
              <li key={i} className={step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}>
                <span className="sn serif">{i + 1}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — chat */}
        <div className="reveal">
          <div className="chat">

            {/* Header */}
            <div className="chat__head">
              <div className="chat__avatar">T</div>
              <div>
                <h4>Thomy · Velme Studio</h4>
                <span className="status">En línea ahora</span>
              </div>
            </div>

            {/* Body */}
            <div className="chat__body" ref={bodyRef}>
              {msgs.map(m => (
                <div key={m.id} className={`msg msg--${m.role}`} style={{ whiteSpace: 'pre-line' }}>
                  {m.text}
                  {m.waBtn && (
                    <a href={m.waBtn} target="_blank" rel="noopener noreferrer" className="msg-wa-btn">
                      💬 Confirmar por WhatsApp →
                    </a>
                  )}
                </div>
              ))}

              {typing && (
                <div className="msg msg--bot">
                  <span className="typing"><i /><i /><i /></span>
                </div>
              )}

              {chips.length > 0 && !typing && (
                <div className="msg-chips">
                  {chips.map(c => (
                    <button key={c.value} type="button" className="msg-chip" onClick={() => onChip(c)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {showUpload && (
                <div
                  className={`chat-upload${yapeThumb ? ' has-img' : ''}`}
                  onClick={() => !yapeThumb && fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pickYape(f) }}
                >
                  {yapeThumb ? (
                    <>
                      <img src={yapeThumb} alt="Comprobante Yape" />
                      <div className="chat-upload__actions">
                        <button type="button" className="btn-text"
                          onClick={e => { e.stopPropagation(); setYapeFile(null); setYapeThumb(null) }}>
                          Cambiar imagen
                        </button>
                        <button type="button" className="btn btn--solid btn--sm"
                          onClick={e => { e.stopPropagation(); confirmYape() }}
                          disabled={uploading}>
                          {uploading ? 'Reservando…' : 'Confirmar reserva →'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="chat-upload__icon">📸</span>
                      <p>Toca aquí o arrastra la captura</p>
                      <p className="chat-upload__hint">JPG, PNG o HEIC</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && pickYape(e.target.files[0])} />

            {/* Input */}
            {phase !== 'done' && (
              <div className="chat__input">
                <input
                  ref={inputRef}
                  type={phase === 'phone' ? 'tel' : 'text'}
                  placeholder={inputPH}
                  value={txt}
                  onChange={e => setTxt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !inputOff && onSend()}
                  disabled={inputOff}
                />
                <button type="button" className="chat__send" onClick={onSend}
                  disabled={!txt.trim() || inputOff}>↑</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
