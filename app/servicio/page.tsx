import { Suspense } from 'react'
import type { Metadata } from 'next'
import NavigationSubpage from '../components/NavigationSubpage'
import Footer from '../components/Footer'
import ServicioClient from './ServicioClient'
import { fetchServices } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Servicio — Velme Studio',
}

export default async function ServicioPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const services = await fetchServices()
  const service = (id ? services.find(s => s.id === id) : null) ?? services[0] ?? null
  const related = service
    ? services.filter(s => s.category === service.category && s.id !== service.id).slice(0, 3)
    : []

  return (
    <>
      <NavigationSubpage />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <ServicioClient service={service} related={related} />
      </Suspense>
      <Footer />
    </>
  )
}
