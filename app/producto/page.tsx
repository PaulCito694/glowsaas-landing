import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import ProductoClient from './ProductoClient'
import { fetchProducts } from '@/lib/api'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Producto — Velme Studio',
}

export const revalidate = 60

export default async function ProductoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const products = await fetchProducts()
  const product = products.find(p => p.id === id) ?? null
  const related = product
    ? products.filter(p => p.id !== product.id && p.cat === product.cat).slice(0, 4)
    : []

  if (!product) {
    return (
      <>
        <NavigationSubpage />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Producto no encontrado.</p>
            <Link href="/productos" className="btn">Ver tienda →</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <NavigationSubpage />
      <CartDrawer />
      <ProductoClient product={product} related={related} />
      <Footer />
    </>
  )
}
