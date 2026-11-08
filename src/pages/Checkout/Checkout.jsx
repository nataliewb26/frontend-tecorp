import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { crearPedido } from "../../services/pedidoService";
import { getProducto } from "../../services/productService";
import { formatMoneyWithCents as money } from "../../utils/formatters";

// [SIN USO] Formateador duplicado; se usa formatMoneyWithCents compartido.
// const money = (value) =>
//   new Intl.NumberFormat("es-PE", {
//     style: "currency",
//     currency: "PEN",
//     maximumFractionDigits: 2,
//   }).format(Number(value) || 0);

function groupDetails(details = []) {
  return details.reduce((grouped, detail) => {
    if (!detail?.campo || !detail?.mensaje) return grouped;
    const field = detail.campo.startsWith("items") ? "items" : detail.campo;
    return {
      ...grouped,
      [field]: [...(grouped[field] || []), detail.mensaje],
    };
  }, {});
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCartProducts,
  } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    direccion_envio: "",
    district: "",
    paymentMethod: "Contra entrega",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: [] }));
  }

  async function refreshCartStock() {
    const results = await Promise.allSettled(
      cart.map((item) => getProducto(item.id))
    );
    const refreshedProducts = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (refreshedProducts.length > 0) {
      syncCartProducts(refreshedProducts);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setFieldErrors({});

    const direccionEnvio = form.direccion_envio.trim();

    if (direccionEnvio.length < 10 || direccionEnvio.length > 300) {
      setFieldErrors({
        direccion_envio: [
          "La dirección de envío debe tener entre 10 y 300 caracteres.",
        ],
      });
      return;
    }

    setSubmitting(true);

    try {
      const order = await crearPedido({
        direccion_envio: direccionEnvio,
        items: cart.map((item) => ({
          producto_id: item.id,
          cantidad: item.quantity,
        })),
      });

      setCompleted(true);
      clearCart();
      navigate("/pedido-confirmado", { replace: true, state: { order } });
    } catch (requestError) {
      if (requestError.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/checkout" },
        });
        return;
      }

      setError(requestError.message || "No se pudo registrar el pedido.");
      setFieldErrors(groupDetails(requestError.detalles));

      if (requestError.status === 409) {
        await refreshCartStock();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.length === 0 && !completed) {
    return <Navigate to="/#catalogo" replace />;
  }

  return (
    <section className="page-container">
      <div className="checkout-heading">
        <span className="eyebrow">TECORP STORE / COMPRA</span>
        <h1>Finalizar compra</h1>
        <p>Completa la dirección y revisa tu pedido antes de confirmarlo.</p>
      </div>

      <div className="checkout-layout">
        <form className="form-card checkout-card" onSubmit={handleSubmit} noValidate>
          <h2>Datos de entrega</h2>

          <label htmlFor="fullName">Nombre completo (opcional)</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nombre y apellidos"
            autoComplete="name"
          />

          <label htmlFor="email">Correo electrónico (opcional)</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />

          <label htmlFor="phone">Teléfono (opcional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Número de contacto"
            autoComplete="tel"
          />

          <label htmlFor="shipping-address">Dirección de envío</label>
          <textarea
            id="shipping-address"
            name="direccion_envio"
            value={form.direccion_envio}
            onChange={handleChange}
            placeholder="Dirección completa, distrito, ciudad y referencias"
            autoComplete="street-address"
            minLength="10"
            maxLength="300"
            rows="3"
            required
          />
          {(fieldErrors.direccion_envio || []).map((message) => (
            <p className="checkout-error" role="alert" key={message}>
              {message}
            </p>
          ))}

          <label htmlFor="district">Distrito / Ciudad (opcional)</label>
          <input
            id="district"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="Dato decorativo; inclúyelo también en la dirección"
          />

          <label htmlFor="paymentMethod">Método de pago</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="Contra entrega">Pago contra entrega</option>
            <option value="Transferencia bancaria">Transferencia bancaria</option>
          </select>
          <p className="checkout-note">Pago simulado</p>

          <label htmlFor="notes">Indicaciones adicionales (opcional)</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Este campo es decorativo y no se envía al servidor"
            rows="3"
          />

          {error && <p className="checkout-error" role="alert">{error}</p>}

          <button
            className="primary-button checkout-submit"
            type="submit"
            disabled={submitting}
          >
            <ShoppingBag size={18} />
            {submitting ? "Registrando pedido..." : "Confirmar pedido"}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <Link to="/#catalogo" className="back-link">Seguir comprando</Link>
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
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={submitting}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={submitting || item.quantity >= Number(item.stock)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="checkout-remove"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                      disabled={submitting}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <small>Stock disponible: {item.stock}</small>
                </div>

                <strong className="checkout-item-price">
                  {money(Number(item.price || 0) * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          {(fieldErrors.items || []).map((message) => (
            <p className="checkout-error" role="alert" key={message}>
              {message}
            </p>
          ))}

          <div className="checkout-total">
            <span>Subtotal estimado</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="checkout-total">
            <span>Envío</span>
            <strong>Por coordinar</strong>
          </div>
          <p className="checkout-note">
            El total definitivo lo calcula el servidor al registrar el pedido.
          </p>
        </aside>
      </div>
    </section>
  );
}
