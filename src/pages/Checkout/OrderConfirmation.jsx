
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <section className="page-container">
        <div className="page-card confirmation-card">
          <Package size={54} />
          <h1>No encontramos los datos del pedido</h1>
          <p>
            Puedes regresar a la tienda y revisar tus productos para realizar
            una nueva compra.
          </p>
          <Link to="/" className="primary-button">
            Volver a la tienda <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="page-card confirmation-card">
        <CheckCircle2 size={64} color="#16a34a" />

        <span className="eyebrow">TECORP STORE</span>
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido fue registrado correctamente.</p>

        <div className="confirmation-order-number">
          <span>Número de pedido</span>
          <strong>{order.id}</strong>
        </div>

        <div className="confirmation-details">
          <h2>Detalles del pedido</h2>

          {(order.detalle_pedido || []).map((item) => (
            <div className="confirmation-item" key={item.producto_id}>
              <span>
                {item.productos?.nombre || `Producto ${item.producto_id}`} × {item.cantidad}
              </span>
              <strong>
                {money(Number(item.precio_unitario || 0) * item.cantidad)}
              </strong>
            </div>
          ))}

          <div className="confirmation-total">
            <span>Total</span>
            <strong>{money(order.total)}</strong>
          </div>
        </div>

        <p className="confirmation-payment">Estado: {order.estado}</p>
        <p className="confirmation-payment">Pago simulado</p>

        <Link
          to="/mis-pedidos"
          state={{ order }}
          className="primary-button"
        >
          Mis pedidos <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
