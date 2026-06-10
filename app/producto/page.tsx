import { Suspense } from 'react'
import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import ProductoClient from './ProductoClient'

export const metadata: Metadata = {
  title: 'Producto — Velme Studio',
}

export default function ProductoPage() {
  return (
    <>
      <NavigationSubpage />
      <CartDrawer />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <ProductoClient />
      </Suspense>
      <Footer />
    </>
  )
}
