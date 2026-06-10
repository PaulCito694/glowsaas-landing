export default function Footer() {
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
          <p>Av. Larco 345, Miraflores</p>
          <p>Lima, Perú</p>
          <p>Lun–Sáb · 10:00–20:00</p>
        </div>
        <div className="footer__col">
          <h5>Contacto</h5>
          <a href="https://wa.me/51999888777">WhatsApp +51 9XX XXX XXX</a>
          <a href="mailto:hola@velmestudio.pe">hola@velmestudio.pe</a>
          <a href="#">@velme.studio</a>
        </div>
        <div className="footer__col">
          <h5>Explora</h5>
          <a href="#servicios">Servicios</a>
          <a href="#tienda">Tienda</a>
          <a href="#reserva">Reserva</a>
        </div>
      </div>

      <div className="footer__legal">
        <span>© 2026 Velme Studio. Todos los derechos reservados.</span>
        <span>Diseñado con detalle · Lima</span>
      </div>
    </footer>
  )
}
