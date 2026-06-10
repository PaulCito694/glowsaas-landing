export interface Product {
  id: string
  name: string
  cat: string
  price: number
  short: string
  long: string[]
}

export const VELME_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Aceite de cutícula', cat: 'Cuidado', price: 38,
    short: 'Mezcla nutritiva de jojoba y vitamina E para cutículas suaves e hidratadas.',
    long: ['Fórmula de absorción rápida que mantiene la cutícula flexible y previene padrastros.', 'Uso diario recomendado para prolongar la duración de tu manicure.'] },
  { id: 'p2', name: 'Sérum de pestañas', cat: 'Pestañas', price: 95,
    short: 'Sérum fortalecedor que estimula pestañas más largas y resistentes.',
    long: ['Complejo de péptidos y biotina que acondiciona la pestaña natural.', 'Aplicar en la línea de pestañas cada noche sobre piel limpia.'] },
  { id: 'p3', name: 'Top coat brillo', cat: 'Uñas', price: 45,
    short: 'Sellador de brillo espejo y secado rápido para un acabado de salón.',
    long: ['Prolonga la duración del esmaltado y aporta un brillo intenso.', 'Compatible con esmalte regular y diseños de nail art.'] },
  { id: 'p4', name: 'Crema de manos premium', cat: 'Cuidado', price: 52,
    short: 'Manteca de karité y almendras para manos sedosas, sin sensación grasa.',
    long: ['Hidratación profunda con acabado seco aterciopelado.', 'Aroma sutil y elegante de la línea Velme.'] },
  { id: 'p5', name: 'Kit de limas pro', cat: 'Uñas', price: 60,
    short: 'Set de limas y pulidor de grano profesional para el cuidado en casa.',
    long: ['Incluye limas de distintos granos y bloque pulidor.', 'Material lavable y reutilizable de larga vida útil.'] },
  { id: 'p6', name: 'Cepillo limpiador lash', cat: 'Pestañas', price: 28,
    short: 'Cepillo suave para la limpieza diaria de tus extensiones.',
    long: ['Mantiene las extensiones libres de residuos y prolonga su duración.', 'Cerdas suaves que respetan la pestaña natural.'] },
  { id: 'p7', name: 'Removedor delicado', cat: 'Uñas', price: 42,
    short: 'Removedor sin acetona que cuida la uña y la hidrata al limpiar.',
    long: ['Retira el esmalte sin resecar la lámina ungueal.', 'Enriquecido con aceites acondicionadores.'] },
  { id: 'p8', name: 'Set regalo Velme', cat: 'Edición', price: 180,
    short: 'Caja de edición con los esenciales Velme para regalar (o regalarte).',
    long: ['Incluye aceite de cutícula, crema de manos y top coat en empaque de lujo.', 'La forma perfecta de llevar la experiencia Velme a casa.'] },
]

export const fmt = (n: number) => 'S/ ' + Number(n).toFixed(0)

export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(m: number): string {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

export function ymd(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
