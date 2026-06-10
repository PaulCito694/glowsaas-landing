'use client'

import { useEffect, useRef } from 'react'

interface MarqueeProps {
  items: string[]
  dir?: 'l' | 'r'
  bone?: boolean
}

export default function Marquee({ items, dir = 'l', bone = false }: MarqueeProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const direction = dir === 'r' ? 1 : -1
    let x = direction < 0 ? 0 : -(row.scrollWidth / 2)
    const speed = 0.4
    let raf: number

    const tick = () => {
      x += speed * direction
      const w = row.scrollWidth / 2
      if (direction < 0 && x <= -w) x = 0
      if (direction > 0 && x >= 0) x = -w
      row.style.transform = `translateX(${x}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [dir])

  const doubled = [...items, ...items]

  return (
    <div className={`marquee${bone ? ' marquee--bone' : ''}`}>
      <div className="marquee__row" ref={rowRef}>
        {doubled.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}
