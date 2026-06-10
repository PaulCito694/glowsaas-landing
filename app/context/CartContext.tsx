'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { VELME_PRODUCTS, Product, fmt } from '../data/velme'

interface CartItem {
  product: Product
  qty: number
}

interface CartContextType {
  items: Record<string, number>
  count: number
  total: string
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (id: string) => void
  setQty: (id: string, delta: number) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({})
  const [isOpen, setIsOpen] = useState(false)

  const count = Object.values(items).reduce((s, n) => s + n, 0)

  const totalNum = Object.keys(items).reduce((s, id) => {
    const p = VELME_PRODUCTS.find(x => x.id === id)
    return p ? s + p.price * items[id] : s
  }, 0)
  const total = 'S/ ' + totalNum.toFixed(2)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback((id: string) => {
    setItems(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    setIsOpen(true)
  }, [])

  const setQty = useCallback((id: string, delta: number) => {
    setItems(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + delta }
      if (next[id] <= 0) delete next[id]
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
