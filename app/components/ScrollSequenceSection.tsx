'use client'
import { useEffect, useRef } from 'react'

const COUNT = 144
const STAGES = [
  { p: 0.00, idx: '01', name: 'Natural',      sub: 'El lienzo · nude pulido' },
  { p: 0.27, idx: '02', name: 'Glitter Oro',  sub: 'Destello total' },
  { p: 0.55, idx: '03', name: 'Cromo Espejo', sub: 'Efecto metal líquido' },
  { p: 0.82, idx: '04', name: 'Animal Print', sub: 'Felino a mano alzada' },
]

function framePath(i: number) {
  return '/sequence/frame_' + String(i).padStart(4, '0') + '.webp'
}

export default function ScrollSequenceSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const loaderRef   = useRef<HTMLDivElement>(null)
  const loaderBarRef = useRef<HTMLElement>(null)
  const barFillRef  = useRef<HTMLElement>(null)
  const idxRef      = useRef<HTMLSpanElement>(null)
  const nameRef     = useRef<HTMLSpanElement>(null)
  const subRef      = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas  = canvasRef.current
    if (!section || !canvas) return

    const loadEl  = loaderRef.current
    const loadBar = loaderBarRef.current
    const barFill = barFillRef.current
    const idxEl   = idxRef.current
    const nameEl  = nameRef.current
    const subEl   = subRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const cvs     = canvas
    const sec     = section
    const context = ctx
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const images: HTMLImageElement[] = new Array(COUNT + 1)
    let loaded = 0, firstReady = false, current = 1, stageNow = -1

    function draw(idx: number) {
      idx = Math.max(1, Math.min(COUNT, idx))
      let img = images[idx]
      if (!img || !img.complete || !img.naturalWidth) {
        for (let j = idx; j >= 1; j--) {
          if (images[j]?.complete && images[j].naturalWidth) { img = images[j]; break }
        }
      }
      if (!img) return
      const cw = cvs.width, ch = cvs.height
      const ir = img.naturalWidth / img.naturalHeight
      const cr = cw / ch
      let dw: number, dh: number, dx: number, dy: number
      if (ir > cr) { dh = ch; dw = ch * ir } else { dw = cw; dh = cw / ir }
      dx = (cw - dw) / 2; dy = (ch - dh) / 2
      context.fillStyle = '#efece6'
      context.fillRect(0, 0, cw, ch)
      context.drawImage(img, dx, dy, dw, dh)
    }

    function setFrame(idx: number) {
      if (idx !== current) { current = idx; draw(idx) }
    }

    function resize() {
      const r   = cvs.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cvs.width  = Math.round(r.width  * dpr)
      cvs.height = Math.round(r.height * dpr)
      draw(current)
    }

    function setStage(p: number) {
      let s = 0
      for (let i = 0; i < STAGES.length; i++) { if (p >= STAGES[i].p) s = i }
      if (s === stageNow) return
      stageNow = s
      const st = STAGES[s]
      if (idxEl) idxEl.textContent = st.idx
      if (nameEl) {
        nameEl.textContent = st.name
        nameEl.classList.remove('swap')
        void nameEl.offsetWidth
        nameEl.classList.add('swap')
      }
      if (subEl) subEl.textContent = st.sub
    }

    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect  = sec.getBoundingClientRect()
        const total = sec.offsetHeight - window.innerHeight
        let p = total > 0 ? (-rect.top) / total : 0
        p = Math.min(1, Math.max(0, p))
        const frame = 1 + Math.round(p * (COUNT - 1))
        setFrame(frame)
        setStage(p)
        if (barFill) barFill.style.transform = 'scaleX(' + p + ')'
        ticking = false
      })
    }

    if (reduce) {
      sec.classList.add('seq--static')
      const im = new Image()
      im.onload = () => { resize(); context.drawImage(im, 0, 0, cvs.width, cvs.height) }
      im.src = framePath(COUNT)
      images[COUNT] = im
      if (loadEl) loadEl.classList.add('done')
      setStage(1)
      const onResizeStatic = () => { resize(); if (im.complete) draw(COUNT) }
      window.addEventListener('resize', onResizeStatic)
      return () => window.removeEventListener('resize', onResizeStatic)
    }

    function preload() {
      for (let i = 1; i <= COUNT; i++) {
        const im = new Image()
        im.decoding = 'async'
        im.onload = () => {
          loaded++
          if (loadBar) loadBar.style.transform = 'scaleX(' + (loaded / COUNT) + ')'
          if (!firstReady) { firstReady = true; resize(); draw(1) }
          if (loaded >= COUNT && loadEl) loadEl.classList.add('done')
        }
        im.onerror = () => { loaded++; if (loaded >= COUNT && loadEl) loadEl.classList.add('done') }
        im.src = framePath(i)
        images[i] = im
      }
    }

    preload()
    resize()
    window.addEventListener('scroll', onScroll, { passive: true })
    let rt: ReturnType<typeof setTimeout>
    const onResizeDynamic = () => { clearTimeout(rt); rt = setTimeout(() => { resize(); onScroll() }, 120) }
    window.addEventListener('resize', onResizeDynamic)
    window.addEventListener('load', onScroll)
    setStage(0)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResizeDynamic)
      window.removeEventListener('load', onScroll)
    }
  }, [])

  return (
    <section className="seq" id="acabado" ref={sectionRef}>
      <div className="seq__pin">
        <div className="seq__copy">
          <p className="eyebrow">El acabado · 01 → 04</p>
          <h2 className="serif seq__title">Una uña,<br /><em>infinitos</em> acabados</h2>
          <p className="seq__lead">Del nude natural al cromo espejo. Así transformamos cada detalle, capa por capa — desliza para ver el proceso.</p>
          <div className="seq__finish">
            <span className="seq__idx" ref={idxRef}>01</span>
            <span className="seq__finish-text">
              <span className="seq__finish-name serif" ref={nameRef}>Natural</span>
              <span className="seq__finish-sub" ref={subRef}>El lienzo · nude pulido</span>
            </span>
          </div>
          <div className="seq__bar"><i ref={barFillRef}></i></div>
        </div>

        <div className="seq__frame">
          <canvas className="seq__canvas" ref={canvasRef}></canvas>
          <div className="seq__loader" ref={loaderRef}>
            <span>Cargando el proceso</span>
            <div className="seq__loader-bar"><i ref={loaderBarRef}></i></div>
          </div>
        </div>

        <div className="seq__hint"><span>Desliza</span><span className="ln"></span></div>
      </div>
    </section>
  )
}
