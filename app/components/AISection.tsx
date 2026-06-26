'use client'

import { useEffect, useRef, useState } from 'react'
import { chatWithAssistant } from '@/lib/api'

interface Message { role: 'user' | 'assistant'; content: string }

export default function AISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [displayMessages, setDisplayMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy Chasqui, la asistente de Velme Studio ✨ Cuéntame qué buscas y te ayudo a elegir tu servicio ideal.' }
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
  }, [displayMessages, typing])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    setDisabled(true)
    if (inputRef.current) inputRef.current.value = ''

    const userMsg: Message = { role: 'user', content: trimmed }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setDisplayMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setTyping(true)

    const reply = await chatWithAssistant(nextHistory)

    setTyping(false)

    const botText = reply || 'No pude responder en este momento. Escríbenos por WhatsApp.'
    const assistantMsg: Message = { role: 'assistant', content: botText }
    setMessages(prev => [...prev, assistantMsg])

    // Typewriter effect
    setDisplayMessages(prev => [...prev, { role: 'bot', text: '' }])
    let i = 0
    const type = () => {
      i++
      setDisplayMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'bot', text: botText.slice(0, i) }
        return next
      })
      if (i < botText.length) setTimeout(type, 12)
      else setDisabled(false)
    }
    setTimeout(type, 12)
  }

  return (
    <section className="assistant" id="asistente" ref={sectionRef}>
      <div className="assistant__inner">
        <div className="assistant__copy">
          <p className="eyebrow reveal" style={{ color: 'var(--ink)', opacity: 1 }}>Chasqui · Asistente IA</p>
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
            <div className="chat__avatar">C</div>
            <div>
              <h4>Chasqui · Velme Studio</h4>
              <div className="status">En línea</div>
            </div>
          </div>

          <div className="chat__body" ref={bodyRef}>
            {displayMessages.map((m, i) => (
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
            <button onClick={() => send('¿Qué productos tienen disponibles?')}>Productos</button>
          </div>

          <div className="chat__input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu consulta…"
              autoComplete="off"
              disabled={disabled}
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
