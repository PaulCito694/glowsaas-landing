import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ProductosClient from './ProductosClient'
import { fetchProducts, fetchProductCategories } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Tienda — Velme Studio',
}

export const revalidate = 60

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchProductCategories()])

  return (
    <>
      <NavigationSubpage />
      <ProductosClient products={products} categories={categories} />
      <Footer />
    </>
  )
}
