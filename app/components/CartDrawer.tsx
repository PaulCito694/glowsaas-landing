'use client'

import { useCart } from '../context/CartContext'
import { fmt } from '../data/velme'

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, setQty } = useCart()

  const entries = Object.values(items)

  return (
    <>
      <aside className={`cart${isOpen ? ' open' : ''}`} aria-label="Carrito">
        <div className="cart__head">
          <h3 className="serif">Tu carrito</h3>
          <button className="cart__close" onClick={closeCart} aria-label="Cerrar">✕</button>
        </div>

        <div className="cart__items">
          {entries.length === 0 ? (
            <p className="cart__empty">
              Tu carrito está vacío.<br />
              Descubre nuestros esenciales de cuidado.
            </p>
          ) : (
            entries.map(({ product: p, qty }) => (
              <div key={p.id} className="cart-item">
                <div className="cart-item__media ph">
                  <span className="ph__tag">{p.cat}</span>
                </div>
                <div className="cart-item__body">
                  <h4>{p.name}</h4>
                  <div className="cart-item__price">{fmt(p.price)}</div>
                  <div className="qty">
                    <button onClick={() => setQty(p.id, -1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(p.id, 1)}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart__foot">
          <div className="cart__total">
            <span>Total</span>
            <strong>{total}</strong>
          </div>
          <a href="#reserva" className="btn btn--on-bone" onClick={closeCart}>
            Finalizar &amp; reservar <span className="arrow">→</span>
          </a>
        </div>
      </aside>

      <div
        className={`scrim${isOpen ? ' open' : ''}`}
        onClick={closeCart}
      />
    </>
  )
}
