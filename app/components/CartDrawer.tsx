'use client'

import { useCart } from '../context/CartContext'
import { VELME_PRODUCTS, fmt } from '../data/velme'

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, setQty } = useCart()

  const ids = Object.keys(items)

  return (
    <>
      <aside className={`cart${isOpen ? ' open' : ''}`} aria-label="Carrito">
        <div className="cart__head">
          <h3 className="serif">Tu carrito</h3>
          <button className="cart__close" onClick={closeCart} aria-label="Cerrar">✕</button>
        </div>

        <div className="cart__items">
          {ids.length === 0 ? (
            <p className="cart__empty">
              Tu carrito está vacío.<br />
              Descubre nuestros esenciales de cuidado.
            </p>
          ) : (
            ids.map(id => {
              const p = VELME_PRODUCTS.find(x => x.id === id)
              if (!p) return null
              return (
                <div key={id} className="cart-item">
                  <div className="cart-item__media ph">
                    <span className="ph__tag">{p.cat}</span>
                  </div>
                  <div className="cart-item__body">
                    <h4>{p.name}</h4>
                    <div className="cart-item__price">{fmt(p.price)}</div>
                    <div className="qty">
                      <button onClick={() => setQty(id, -1)}>−</button>
                      <span>{items[id]}</span>
                      <button onClick={() => setQty(id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              )
            })
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
