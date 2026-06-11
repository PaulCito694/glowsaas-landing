import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ServiciosClient from './ServiciosClient'
import { fetchServices, fetchServiceCategories } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Servicios — Velme Studio',
}

export const revalidate = 60

export default async function ServiciosPage() {
  const [services, categories] = await Promise.all([fetchServices(), fetchServiceCategories()])

  return (
    <>
      <NavigationSubpage />
      <ServiciosClient services={services} categories={categories} />
      <Footer />
    </>
  )
}
