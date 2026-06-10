'use client'

import { useEffect, useRef, useState } from 'react'

const FALLBACK: Record<string, string> = {
  pesta: 'Para tus pestañas te recomiendo el Lifting + tinte (S/ 120) si quieres un look natural, o el Volumen Ruso (S/ 210) para máximo impacto. ¿Buscas algo natural o dramático? ✨',
  uña: 'Nuestro Manicure Ruso (S/ 80) deja la cutícula impecable. Si quieres color duradero, el semipermanente (S/ 65) es ideal. ¿Te gustaría agregar nail art?',
  una: 'Nuestro Manicure Ruso (S/ 80) deja la cutícula impecable. Si quieres color duradero, el semipermanente (S/ 65) es ideal. ¿Te gustaría agregar nail art?',
  precio: 'Manicure Ruso S/ 80 · Semipermanente S/ 65 · Acrílicas S/ 130. En pestañas, Lifting S/ 120 y Volumen Ruso S/ 210. ¿Sobre cuál te cuento más?',
  horario: 'Atendemos de lunes a sábado, 10:00 a 20:00, en Miraflores. Las citas se reservan con un 20% de adelanto.',
  reserv: '¡Con gusto! Baja a la sección "Reserva tu cita" y completa tus datos. Te confirmamos por WhatsApp en minutos. ✨',
  default: 'Con gusto te ayudo a elegir el servicio ideal. ¿Te interesan las uñas o las pestañas? También puedo contarte de precios y horarios. 💅',
}

function fallbackReply(text: string) {
  const t = text.toLowerCase()
  for (const k in FALLBACK) {
    if (k !== 'default' && t.includes(k)) return FALLBACK[k]
  }
  return FALLBACK.default
}

interface Message { role: 'user' | 'bot'; text: string }

export default function AISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Soy la asistente de Velme Studio ✨ Cuéntame qué buscas y te ayudo a elegir tu servicio ideal.' }
  ])
  const [typing, setTyping] = useState(false)
  const [disabled, setDisabled] = useState(false)

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

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, typing])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    setDisabled(true)
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    if (inputRef.current) inputRef.current.value = ''
    setTyping(true)

    await new Promise(r => setTimeout(r, 900 + Math.random() * 600))
    const reply = fallbackReply(trimmed)
    setTyping(false)

    // Typewriter effect
    setMessages(prev => [...prev, { role: 'bot', text: '' }])
    let i = 0
    const type = () => {
      i++
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'bot', text: reply.slice(0, i) }
        return next
      })
      if (i < reply.length) setTimeout(type, 14)
      else setDisabled(false)
    }
    setTimeout(type, 14)
  }

  return (
    <section className="assistant" id="asistente" ref={sectionRef}>
      <div className="assistant__inner">
        <div className="assistant__copy">
          <p className="eyebrow reveal" style={{ color: 'var(--ink)', opacity: 1 }}>Asistente Velme · IA</p>
          <div className="reveal"><h2 className="serif">¿No sabes qué <em>elegir</em>?</h2></div>
          <p className="reveal">
            Pregúntale a nuestra asistente. Te recomienda el servicio ideal según tu estilo, resuelve dudas de cuidado y te orienta para reservar — al instante.
          </p>
          <div className="assistant__chips reveal">
            <button className="chip" onClick={() => send('¿Qué pestañas me recomiendan para un look natural?')}>Look natural en pestañas</button>
            <button className="chip" onClick={() => send('¿Cuánto dura el esmaltado semipermanente?')}>Duración del semipermanente</button>
            <button className="chip" onClick={() => send('¿Cuáles son sus horarios y dónde están?')}>Horarios y ubicación</button>
          </div>
        </div>

        <div className="chat reveal">
          <div className="chat__head">
            <div className="chat__avatar">V</div>
            <div>
              <h4>Asistente Velme</h4>
              <div className="status">En línea</div>
            </div>
          </div>

          <div className="chat__body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg msg--${m.role}`}>{m.text}</div>
            ))}
            {typing && (
              <div className="msg msg--bot">
                <span className="typing"><i /><i /><i /></span>
              </div>
            )}
          </div>

          <div className="chat__suggest">
            <button onClick={() => send('Quiero algo elegante para un evento, ¿qué me recomiendan?')}>Tengo un evento</button>
            <button onClick={() => send('¿Cuánto cuesta el volumen ruso?')}>Precio volumen ruso</button>
            <button onClick={() => send('Quiero reservar una cita')}>Reservar</button>
          </div>

          <div className="chat__input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu consulta…"
              autoComplete="off"
              onKeyDown={e => { if (e.key === 'Enter') send((e.target as HTMLInputElement).value) }}
            />
            <button
              className="chat__send"
              disabled={disabled}
              onClick={() => inputRef.current && send(inputRef.current.value)}
              aria-label="Enviar"
            >↑</button>
          </div>
        </div>
      </div>
    </section>
  )
}
