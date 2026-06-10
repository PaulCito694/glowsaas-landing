import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ProductosClient from './ProductosClient'

export const metadata: Metadata = {
  title: 'Tienda — Velme Studio',
}

export default function ProductosPage() {
  return (
    <>
      <NavigationSubpage />
      <ProductosClient />
      <Footer />
    </>
  )
}
