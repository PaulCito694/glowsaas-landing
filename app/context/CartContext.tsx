'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { LandingProduct } from '@/lib/api'

export type { LandingProduct }

interface CartEntry {
  product: LandingProduct
  qty: number
}

interface CartContextType {
  items: Record<string, CartEntry>
  count: number
  total: string
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (product: LandingProduct) => void
  setQty: (id: string, delta: number) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, CartEntry>>({})
  const [isOpen, setIsOpen] = useState(false)

  const count    = Object.values(items).reduce((s, e) => s + e.qty, 0)
  const totalNum = Object.values(items).reduce((s, e) => s + e.product.price * e.qty, 0)
  const total    = 'S/ ' + totalNum.toFixed(2)

  const openCart  = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback((product: LandingProduct) => {
    setItems(prev => ({
      ...prev,
      [product.id]: { product, qty: (prev[product.id]?.qty || 0) + 1 },
    }))
    setIsOpen(true)
  }, [])

  const setQty = useCallback((id: string, delta: number) => {
    setItems(prev => {
      if (!prev[id]) return prev
      const next = { ...prev, [id]: { ...prev[id], qty: prev[id].qty + delta } }
      if (next[id].qty <= 0) delete next[id]
      return next
    })
  }, [])

  return (
    <CartContext.Provider value={{ items, count, total, isOpen, openCart, closeCart, addToCart, setQty }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
