
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

const money = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    district: "",
    paymentMethod: "Contra entrega",
    notes: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Tu carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    const order = {
      id: `TEC-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      customer: { ...form },
      items: cart.map((item) => ({ ...item })),
      subtotal,
      total: subtotal,
      status: "Pendiente",
      paymentMethod: form.paymentMethod,
    };

    // Registro temporal para la demostración frontend.
    // Más adelante se reemplazará por la petición al backend.
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("tecorp_orders") || "[]"
      );

      localStorage.setItem(
        "tecorp_orders",
        JSON.stringify([order, ...savedOrders])
      );
    } catch {
      setError("No se pudo preparar el pedido. Inténtalo nuevamente.");
      return;
    }

    clearCart();
    navigate("/pedido-confirmado", { state: { order } });
  }

  if (cart.length === 0) {
    return (
      <section className="page-container">
        <div className="page-card empty-checkout">
          <ShoppingCart size={48} />
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos a tu carrito para poder finalizar tu compra.</p>
          <Link to="/" className="primary-button">
            Ir a la tienda <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="checkout-heading">
        <span className="eyebrow">TECORP STORE / COMPRA</span>
        <h1>Finalizar compra</h1>
        <p>Completa tus datos y revisa tu pedido antes de confirmarlo.</p>
      </div>

      <div className="checkout-layout">
        <form className="form-card checkout-card" onSubmit={handleSubmit}>
          <h2>Datos de entrega</h2>

          <label htmlFor="fullName">Nombre completo</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nombre y apellidos"
            autoComplete="name"
            required
          />

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />

          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Número de contacto"
            autoComplete="tel"
            pattern="[0-9+ ()-]{7,20}"
            required
          />

          <label htmlFor="address">Dirección de entrega</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Dirección completa"
            autoComplete="street-address"
            required
          />

          <label htmlFor="district">Distrito / Ciudad</label>
          <input
            id="district"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="Ej. Lima, Los Olivos"
            required
          />

          <label htmlFor="paymentMethod">Método de pago</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="Contra entrega">Pago contra entrega</option>
            <option value="Transferencia bancaria">
              Transferencia bancaria
            </option>
          </select>

          <label htmlFor="notes">Indicaciones adicionales (opcional)</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Referencias para encontrar tu dirección..."
            rows="3"
          />

          {error && <p className="checkout-error">{error}</p>}

          <button className="primary-button checkout-submit" type="submit">
            <ShoppingBag size={18} />
            Confirmar pedido
            <ArrowRight size={18} />
          </button>

          <Link to="/" className="back-link">
            Seguir comprando
          </Link>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen de tu pedido</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <article className="checkout-item" key={item.id}>
                <div className="checkout-item-info">
                  <strong>{item.name}</strong>
                  <span>{money(item.price)} por unidad</span>

                  <div className="checkout-quantity">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= Number(item.stock)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="checkout-remove"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <strong className="checkout-item-price">
                  {money(Number(item.price || 0) * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          <div className="checkout-total">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="checkout-total">
            <span>Envío</span>
            <strong>Por coordinar</strong>
          </div>
          <div className="checkout-grand-total">
            <span>Total</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <p className="checkout-note">
            El costo de envío se coordinará según la dirección de entrega.
          </p>
        </aside>
      </div>
    </section>
  );
}
