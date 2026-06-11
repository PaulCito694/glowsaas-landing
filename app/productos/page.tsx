import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ProductosClient from './ProductosClient'
import { fetchProducts } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Tienda — Velme Studio',
}

export const revalidate = 60

export default async function ProductosPage() {
  const products = await fetchProducts()

  return (
    <>
      <NavigationSubpage />
      <ProductosClient products={products} />
      <Footer />
    </>
  )
}
