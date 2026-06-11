import type { CompanyInfo, DayHours } from '@/lib/api'

const DAY_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function hoursLines(hours: DayHours[]): string[] {
  const open = [1,2,3,4,5,6,0]
    .map(d => hours.find(h => h.dayOfWeek === d))
    .filter((h): h is DayHours => !!h && !h.isClosed && !!h.openTime && !!h.closeTime)

  if (!open.length) return []

  const lines: string[] = []
  let i = 0
  while (i < open.length) {
    const start = open[i]
    let j = i
    while (
      j + 1 < open.length &&
      open[j + 1].openTime === start.openTime &&
      open[j + 1].closeTime === start.closeTime
    ) j++
    const dayRange = j > i
      ? `${DAY_SHORT[open[i].dayOfWeek]}–${DAY_SHORT[open[j].dayOfWeek]}`
      : DAY_SHORT[open[i].dayOfWeek]
    lines.push(`${dayRange} · ${start.openTime}–${start.closeTime}`)
    i = j + 1
  }
  return lines
}

export default function Footer({
  company,
  hours = [],
}: {
  company?: CompanyInfo | null
  hours?: DayHours[]
}) {
  const address   = company?.address   || 'Miraflores, Lima, Perú'
  const phone     = company?.phone     || null
  const email     = company?.email     || null
  const name      = company?.name      || 'Velme Studio'
  const instagram = company?.instagram || null
  const tiktok    = company?.tiktok    || null
  const facebook  = company?.facebook  || null
  const youtube   = company?.youtube   || null
  const schedule  = hoursLines(hours)
  const phoneHref = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : null

  const socials = [
    instagram && { label: `Instagram · ${instagram}`, href: `https://instagram.com/${instagram.replace('@','')}` },
    tiktok    && { label: `TikTok · ${tiktok}`,       href: `https://tiktok.com/@${tiktok.replace('@','')}` },
    facebook  && { label: `Facebook · ${facebook}`,   href: `https://facebook.com/${facebook.replace('@','')}` },
    youtube   && { label: `YouTube · ${youtube}`,     href: `https://youtube.com/@${youtube.replace('@','')}` },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <footer className="footer">
      <div className="footer__sign">
        <div className="wordmark footer__word"><span className="vee">V</span>ELME</div>
        <div className="wordmark__sub">
          <span className="ln" /><span className="txt">Studio</span><span className="ln" />
        </div>
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <h5>Estudio</h5>
          <p>{address}</p>
          {schedule.length > 0
            ? schedule.map((l, i) => <p key={i}>{l}</p>)
            : <p>Atención con cita previa</p>}
        </div>
        <div className="footer__col">
          <h5>Contacto</h5>
          {phoneHref
            ? <a href={phoneHref}>WhatsApp {phone}</a>
            : <span style={{ color: 'var(--muted)' }}>—</span>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {socials.map(s => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </div>
        <div className="footer__col">
          <h5>Explora</h5>
          <a href="#servicios">Servicios</a>
          <a href="#tienda">Tienda</a>
          <a href="#reserva">Reserva</a>
        </div>
      </div>

      <div className="footer__legal">
        <span>© {new Date().getFullYear()} {name}. Todos los derechos reservados.</span>
        <span>Diseñado con detalle · Lima</span>
      </div>
    </footer>
  )
}
