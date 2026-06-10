import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ServiciosClient from './ServiciosClient'
import { fetchServices } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Servicios — Velme Studio',
}

export default async function ServiciosPage() {
  const services = await fetchServices()

  return (
    <>
      <NavigationSubpage />
      <ServiciosClient services={services} />
      <Footer />
    </>
  )
}
