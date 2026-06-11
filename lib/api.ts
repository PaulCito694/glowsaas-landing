export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3000'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LandingProduct {
  id: string
  name: string
  cat: string
  price: number
  imageUrl: string | null
  short: string
  long: string[]
}

export interface StaffMember {
  id: string
  name: string
  initials: string
  color: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: number
  durationMin: number
  priceFrom: boolean
  tag: string
  shortDesc: string
  longDesc: string[]
  serviceIncludes: string[]
  care: string
  imageUrl: string | null
  staff: StaffMember[]
}

export interface CompanyInfo {
  id: number
  name: string | null
  rubro: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  ruc: string | null
  bankName: string | null
  bankAccount: string | null
  paymentMethods: string | null
}

export interface DayHours {
  id: number
  dayOfWeek: number
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface BookedSlot {
  start: string
  durationMin: number
}

export interface AppointmentInput {
  date: string
  start: string
  serviceId: string
  customerName: string
  customerPhone?: string
  notes?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function durStr(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return [h ? `${h}h` : '', m ? `${m} min` : ''].filter(Boolean).join(' ')
}

/** Returns slots (HH:MM strings) for a given date according to business hours. */
export function slotsForDate(date: Date, hours: DayHours[], interval = 60): string[] {
  const cfg = hours.find(h => h.dayOfWeek === date.getDay())
  if (!cfg || cfg.isClosed || !cfg.openTime || !cfg.closeTime) return []

  const [oh, om] = cfg.openTime.split(':').map(Number)
  const [ch, cm] = cfg.closeTime.split(':').map(Number)
  const open = oh * 60 + om
  const close = ch * 60 + cm

  const slots: string[] = []
  for (let t = open; t < close; t += interval) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return slots
}

/** True if the slot is covered by any booked appointment. */
export function isSlotBooked(slot: string, booked: BookedSlot[]): boolean {
  const [sh, sm] = slot.split(':').map(Number)
  const slotMin = sh * 60 + sm
  return booked.some(b => {
    const [bh, bm] = b.start.split(':').map(Number)
    const bStart = bh * 60 + bm
    return slotMin >= bStart && slotMin < bStart + b.durationMin
  })
}

/** Whether the given date is open according to business hours. */
export function isDayOpen(date: Date, hours: DayHours[]): boolean {
  const cfg = hours.find(h => h.dayOfWeek === date.getDay())
  return !!cfg && !cfg.isClosed
}

// ── Fetch functions ───────────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${ADMIN_URL}/api/public/services`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.services ?? []
  } catch {
    return []
  }
}

export async function fetchCompany(): Promise<{ company: CompanyInfo | null; hours: DayHours[] }> {
  try {
    const res = await fetch(`${ADMIN_URL}/api/public/company`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { company: null, hours: [] }
    return res.json()
  } catch {
    return { company: null, hours: [] }
  }
}

export async function fetchAvailability(date: string): Promise<BookedSlot[]> {
  try {
    const res = await fetch(
      `${ADMIN_URL}/api/public/availability?date=${date}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.booked ?? []
  } catch {
    return []
  }
}

export async function fetchProducts(): Promise<LandingProduct[]> {
  try {
    const res = await fetch(`${ADMIN_URL}/api/public/products`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const rows = await res.json()
    return rows.map((r: { id: string; name: string; cat: string; price: number; imageUrl: string | null }) => ({
      ...r,
      short: '',
      long: [],
    }))
  } catch {
    return []
  }
}

export async function createAppointment(input: AppointmentInput): Promise<{ appointmentId: number } | null> {
  try {
    const res = await fetch(`${ADMIN_URL}/api/public/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
