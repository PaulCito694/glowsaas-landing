import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import Marquee from './components/Marquee'
import ScrollSequenceSection from './components/ScrollSequenceSection'
import ServicesSection from './components/ServicesSection'
import StoreSection from './components/StoreSection'
import CartDrawer from './components/CartDrawer'
import ChatBookingSection from './components/ChatBookingSection'
import GallerySection from './components/GallerySection'
import Footer from './components/Footer'
import { fetchServices, fetchCompany, fetchProducts, fetchGallery } from '@/lib/api'

const marqueeServices = [
  'Manicure Ruso', 'Volumen Ruso', 'Lifting de Pestañas',
  'Nail Art', 'Soft Gel', 'Spa de Manos',
]

const marqueePhrases = [
  'El detalle es el lujo', 'Hecho a tu medida', 'Miraflores, Lima',
]

export default async function Home() {
  const [services, { company, hours }, products, galleryItems] = await Promise.all([
    fetchServices(),
    fetchCompany(),
    fetchProducts(),
    fetchGallery(),
  ])

  return (
    <>
      <Navigation />
      <CartDrawer />
      <main>
        <HeroSection heroPhoto1={company?.heroPhoto1 ?? null} heroPhoto2={company?.heroPhoto2 ?? null} />
        <Marquee items={marqueeServices} dir="l" />
        <ScrollSequenceSection />
        <ServicesSection services={services} />
        <StoreSection products={products} />
        <ChatBookingSection company={company} hours={hours} />
        <Marquee items={marqueePhrases} dir="r" bone />
        <GallerySection items={galleryItems} />
      </main>
      <Footer company={company} hours={hours} />
    </>
  )
}
