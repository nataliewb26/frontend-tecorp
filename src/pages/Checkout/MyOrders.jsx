import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import { listarMisPedidos } from "../../services/pedidoService";
import { formatDate, formatMoney } from "../../utils/formatters";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    listarMisPedidos()
      .then((response) => {
        if (active) setOrders(Array.isArray(response) ? response : []);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "No se pudieron cargar tus pedidos.");
          setOrders([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  function retry() {
    setLoading(true);
    setError("");
    setRetryKey((value) => value + 1);
  }

  return (
    <section className="page-container">
      <div className="page-card" style={{ width: "min(980px, 100%)" }}>
        <span className="eyebrow">TECORP STORE / MIS PEDIDOS</span>
        <h1>Mis pedidos</h1>

        {loading && <p role="status">Cargando tus pedidos...</p>}

        {!loading && error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" className="primary-button" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="confirmation-card">
            <Package size={54} />
            <h2>Aún no tienes pedidos</h2>
            <p>Explora el catálogo y encuentra tu próximo producto.</p>
            <Link to="/#catalogo" className="primary-button">
              Ir al catálogo <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: "grid", gap: 20 }}>
            {orders.map((order) => (
              <article
                key={order.id}
                style={{
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span>Número de pedido</span>
                    <h2 style={{ margin: "4px 0" }}>{order.id}</h2>
                    <small>{formatDate(order.creado_en)}</small>
                  </div>
                  <OrderStatusBadge estado={order.estado} />
                </div>

                <p><strong>Dirección:</strong> {order.direccion_envio}</p>
                <div className="admin-order-products">
                  <h3>Productos</h3>
                  {(order.detalle_pedido || []).map((item, index) => (
                    <div
                      className="admin-order-product"
                      key={`${item.producto_id}-${index}`}
                    >
                      <span>
                        {item.productos?.nombre || "Producto"} · {item.cantidad} ×{" "}
                        {formatMoney(item.precio_unitario)}
                      </span>
                      <strong>
                        {formatMoney(
                          Number(item.precio_unitario) * Number(item.cantidad)
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="confirmation-total">
                  <span>Total</span>
                  <strong>{formatMoney(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
