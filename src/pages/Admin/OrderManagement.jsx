
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Eye,
  X,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

const STORAGE_KEY = "tecorp_orders";

const statuses = [
  "Pendiente",
  "Confirmado",
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
];

const money = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function readOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function formatDate(value) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function OrderManagement() {
  const [orders, setOrders] = useState(readOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = order.customer || {};

      const matchesSearch =
        !term ||
        String(order.id || "").toLowerCase().includes(term) ||
        String(customer.fullName || "").toLowerCase().includes(term) ||
        String(customer.email || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "Todos" ||
        (order.status || "Pendiente") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalSales = orders
    .filter((order) => order.status !== "Cancelado")
    .reduce((total, order) => total + Number(order.total || 0), 0);

  function updateStatus(orderId, newStatus) {
    const updatedOrders = orders.map((order) =>
      String(order.id) === String(orderId)
        ? { ...order, status: newStatus }
        : order
    );

    setOrders(updatedOrders);

    if (
      selectedOrder &&
      String(selectedOrder.id) === String(orderId)
    ) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  }

  function refreshOrders() {
    setOrders(readOrders());
  }

  return (
    <section className="admin-orders">
      <div className="admin-orders-heading">
        <div>
          <span className="eyebrow">TECORP STORE / ADMINISTRACIÓN</span>
          <h1>Gestión de pedidos</h1>
          <p>Consulta las compras y actualiza el estado de cada pedido.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={refreshOrders}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="admin-order-stats">
        <article className="admin-order-stat">
          <span>Pedidos registrados</span>
          <strong>{orders.length}</strong>
          <Package size={22} />
        </article>

        <article className="admin-order-stat">
          <span>Pedidos pendientes</span>
          <strong>
            {orders.filter((order) => order.status === "Pendiente").length}
          </strong>
          <ClipboardList size={22} />
        </article>

        <article className="admin-order-stat">
          <span>Ventas no canceladas</span>
          <strong>{money(totalSales)}</strong>
          <Package size={22} />
        </article>
      </div>

      <div className="admin-orders-panel">
        <div className="admin-orders-toolbar">
          <div className="admin-orders-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar por pedido, cliente o correo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar pedidos por estado"
          >
            <option value="Todos">Todos los estados</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <Package size={42} />
            <h2>No hay pedidos para mostrar</h2>
            <p>
              Cuando se registren compras desde la tienda, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <strong>{order.customer?.fullName || "Sin nombre"}</strong>
                      <span>{order.customer?.email || "Sin correo"}</span>
                    </td>
                    <td>{formatDate(order.date)}</td>
                    <td>
                      <strong>{money(order.total)}</strong>
                    </td>
                    <td>
                      <select
                        className={`admin-status-select status-${(
                          order.status || "Pendiente"
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                        value={order.status || "Pendiente"}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value)
                        }
                        aria-label={`Estado del pedido ${order.id}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-order-detail-button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`Ver pedido ${order.id}`}
                      >
                        <Eye size={17} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="admin-order-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="admin-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            <div className="admin-order-modal-heading">
              <div>
                <span className="eyebrow">DETALLE DEL PEDIDO</span>
                <h2 id="order-modal-title">{selectedOrder.id}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Cerrar detalle"
                className="admin-order-close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="admin-order-customer">
              <h3>Datos del cliente</h3>
              <p>
                <strong>Nombre:</strong>{" "}
                {selectedOrder.customer?.fullName || "No disponible"}
              </p>
              <p>
                <strong>Correo:</strong>{" "}
                {selectedOrder.customer?.email || "No disponible"}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {selectedOrder.customer?.phone || "No disponible"}
              </p>
              <p>
                <strong>Dirección:</strong>{" "}
                {selectedOrder.customer?.address || "No disponible"}
              </p>
              <p>
                <strong>Distrito:</strong>{" "}
                {selectedOrder.customer?.district || "No disponible"}
              </p>
              <p>
                <strong>Fecha:</strong> {formatDate(selectedOrder.date)}
              </p>
              <p>
                <strong>Pago:</strong>{" "}
                {selectedOrder.paymentMethod || "No especificado"}
              </p>
              {selectedOrder.customer?.notes && (
                <p>
                  <strong>Indicaciones:</strong>{" "}
                  {selectedOrder.customer.notes}
                </p>
              )}
            </div>

            <div className="admin-order-products">
              <h3>Productos</h3>

              {(selectedOrder.items || []).map((item) => (
                <div className="admin-order-product" key={item.id}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>
                    {money(Number(item.price || 0) * Number(item.quantity || 0))}
                  </strong>
                </div>
              ))}
            </div>

            <div className="admin-order-modal-total">
              <span>Total del pedido</span>
              <strong>{money(selectedOrder.total)}</strong>
            </div>

            <button
              type="button"
              className="primary-button admin-order-modal-button"
              onClick={() => setSelectedOrder(null)}
            >
              Cerrar detalle
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
