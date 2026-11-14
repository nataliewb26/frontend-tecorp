import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
} from "lucide-react";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import {
  actualizarEstadoPedido,
  listarPedidos,
} from "../../services/pedidoService";
import {
  formatDate,
  formatMoneyWithCents as formatMoney,
} from "../../utils/formatters";

const PAGE_SIZE = 10;
const STATUSES = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];
const TRANSITIONS = {
  pendiente: ["pagado", "cancelado"],
  pagado: ["enviado", "cancelado"],
  enviado: ["entregado"],
  entregado: [],
  cancelado: [],
};

const statusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    let active = true;

    listarPedidos({
      estado: statusFilter || undefined,
      pagina: page,
      limite: PAGE_SIZE,
    })
      .then((response) => {
        if (!active) return;
        setOrders(Array.isArray(response.datos) ? response.datos : []);
        setTotal(Number(response.total) || 0);
        setPages(Math.max(1, Number(response.paginas) || 1));
      })
      .catch((requestError) => {
        if (!active) return;
        setOrders([]);
        setError(
          requestError.status === 403
            ? "No tienes permisos para gestionar pedidos."
            : requestError.message || "No se pudieron cargar los pedidos."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [statusFilter, page, retryKey]);

  function reload() {
    setLoading(true);
    setError("");
    setNotice("");
    setRetryKey((value) => value + 1);
  }

  function changeFilter(event) {
    setLoading(true);
    setError("");
    setExpandedOrderId(null);
    setPage(1);
    setStatusFilter(event.target.value);
  }

  function goToPage(nextPage) {
    setLoading(true);
    setError("");
    setExpandedOrderId(null);
    setPage(nextPage);
  }

  async function changeStatus(order, nextStatus) {
    if (!nextStatus) return;

    if (
      nextStatus === "cancelado" &&
      !window.confirm("¿Cancelar este pedido? Se devolverá el stock.")
    ) {
      return;
    }

    setUpdatingOrderId(order.id);
    setError("");
    setNotice("");

    try {
      const updatedOrder = await actualizarEstadoPedido(order.id, nextStatus);

      setOrders((currentOrders) =>
        currentOrders
          .map((currentOrder) =>
            String(currentOrder.id) === String(order.id)
              ? updatedOrder
              : currentOrder
          )
          .filter(
            (currentOrder) =>
              !statusFilter || currentOrder.estado === statusFilter
          )
      );
      setNotice(`El pedido ${order.id} ahora está ${updatedOrder.estado}.`);
    } catch (requestError) {
      setError(
        requestError.status === 403
          ? "No tienes permisos para actualizar pedidos."
          : requestError.message || "No se pudo actualizar el pedido."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
  <section className="admin-page admin-orders">
    <Link to="/admin" className="admin-orders-back">
      <ArrowLeft size={17} />
      Volver al panel
    </Link>

    <div className="admin-orders-heading">
      <div>
        <span className="eyebrow">
          TECORP STORE / ADMINISTRACIÓN
        </span>

        <h1>Gestión de pedidos</h1>

        <p>
          Consulta las compras y actualiza el estado
          de cada pedido.
        </p>
      </div>

      <button
        type="button"
        className="admin-refresh-button"
        onClick={reload}
        disabled={loading}
      >
        <RefreshCw
          size={17}
          className={loading ? "admin-refresh-spin" : ""}
        />
        {loading ? "Actualizando..." : "Actualizar"}
      </button>
    </div>

    <div className="admin-order-stats">
  <article className="admin-order-stat">
    <div className="admin-order-stat-icon">
      <Package size={24} />
    </div>

    <div className="admin-order-stat-content">
      <span>
        {statusFilter
          ? `Pedidos: ${statusLabel(statusFilter)}`
          : "Pedidos registrados"}
      </span>

      <strong>{loading || error ? "—" : total}</strong>

      <p>
        {statusFilter
          ? "Resultados del estado seleccionado"
          : "Total de pedidos en el sistema"}
      </p>
    </div>
  </article>
</div>

      <div className="admin-orders-panel">
        <div className="admin-orders-toolbar">
          <div className="admin-orders-table-heading">
            <h2>Listado de pedidos</h2>
            <p>
              {loading
                ? "Cargando pedidos..."
                : error
                  ? "No se pudieron consultar los pedidos"
                  : `${total} ${total === 1 ? "pedido encontrado" : "pedidos encontrados"}`}
            </p>
          </div>
          <select value={statusFilter} onChange={changeFilter} aria-label="Filtrar pedidos por estado">
            <option value="">Todos los estados</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{statusLabel(status)}</option>
            ))}
          </select>
        </div>

        {notice && <p role="status" style={{ padding: "0 20px" }}>{notice}</p>}

        {loading && (
          <div className="admin-orders-empty" role="status">
            <h2>Cargando pedidos...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="admin-orders-empty" role="alert">
            <h2>No se pudieron cargar los pedidos</h2>
            <p>{error}</p>
            <button type="button" className="primary-button" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="admin-orders-empty">
            <Package size={42} />
            <h2>No hay pedidos para mostrar</h2>
            <p>No hay resultados para el estado seleccionado.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = String(expandedOrderId) === String(order.id);
                  const transitions = TRANSITIONS[order.estado] || [];
                  const isUpdating = String(updatingOrderId) === String(order.id);

                  return (
                    <Fragment key={order.id}>
                      <tr>
                        <td><strong>{order.id}</strong></td>
                        <td>
                          <strong>{order.usuarios?.nombre || "Sin nombre"}</strong>
                          <span>{order.usuarios?.email || "Sin correo"}</span>
                        </td>
                        <td>{formatDate(order.creado_en)}</td>
                        <td><strong>{formatMoney(order.total)}</strong></td>
                        <td><OrderStatusBadge estado={order.estado} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="admin-order-detail-button"
                              onClick={() =>
                                setExpandedOrderId(isExpanded ? null : order.id)
                              }
                            >
                              {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                              {isExpanded ? "Ocultar" : "Ver"}
                            </button>

                            {transitions.length > 0 && (
                              <select
                                className="admin-status-select"
                                value=""
                                disabled={isUpdating}
                                onChange={(event) => changeStatus(order, event.target.value)}
                                aria-label={`Cambiar estado del pedido ${order.id}`}
                              >
                                <option value="">
                                  {isUpdating ? "Actualizando..." : "Cambiar estado"}
                                </option>
                                {transitions.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="6">
                            <div className="admin-order-customer">
                              <h3>Datos del pedido</h3>
                              <p><strong>Dirección:</strong> {order.direccion_envio}</p>
                              <p><strong>Teléfono:</strong> {order.usuarios?.telefono || "No disponible"}</p>
                            </div>
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
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pages > 1 && (
          <nav
            aria-label="Paginación de pedidos"
            style={{ display: "flex", gap: 8, padding: 20, justifyContent: "center" }}
          >
            <button
              type="button"
              className="admin-refresh-button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Anterior
            </button>
            <span style={{ alignSelf: "center" }}>Página {page} de {pages}</span>
            <button
              type="button"
              className="admin-refresh-button"
              disabled={page >= pages}
              onClick={() => goToPage(page + 1)}
            >
              Siguiente
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
