import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { listarPedidos } from "../../services/pedidoService";
import "../../styles/admin/CustomerManagement.css";

const PAGE_SIZE = 10;
const API_PAGE_SIZE = 100;

// Obtiene todos los pedidos y extrae únicamente
// la información de contacto de los usuarios.
async function obtenerClientes(isActive) {
  const clientes = new Map();

  let pagina = 1;
  let paginas = 1;

  do {
    const response = await listarPedidos({
      pagina,
      limite: API_PAGE_SIZE,
    });

    if (!isActive()) return [];

    if (!Array.isArray(response.datos)) {
      throw new Error("La API devolvió una respuesta inesperada.");
    }

    paginas = Math.max(1, Number(response.paginas) || 1);

    response.datos.forEach((pedido) => {
      const usuario = pedido.usuarios;
      const id = usuario?.id ?? pedido.usuario_id;

      if (!usuario || id == null) return;

      const key = String(id);
      const existente = clientes.get(key);

      const fechaPedido = new Date(pedido.creado_en).getTime();
      const fechaValida = Number.isFinite(fechaPedido)
        ? fechaPedido
        : 0;

      if (!existente) {
        clientes.set(key, {
          id,
          nombre: usuario.nombre || "",
          email: usuario.email || "",
          telefono: usuario.telefono || "",
          direccion: pedido.direccion_envio || "",
          fechaDireccion: fechaValida,
        });

        return;
      }

      // Completa únicamente datos reales disponibles.
      existente.nombre ||= usuario.nombre || "";
      existente.email ||= usuario.email || "";
      existente.telefono ||= usuario.telefono || "";

      // Conserva la dirección de envío más reciente.
      if (
        pedido.direccion_envio &&
        (!existente.direccion ||
          fechaValida > existente.fechaDireccion)
      ) {
        existente.direccion = pedido.direccion_envio;
        existente.fechaDireccion = fechaValida;
      }
    });

    pagina += 1;
  } while (pagina <= paginas && isActive());

  return Array.from(clientes.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
    })
  );
}

export default function CustomerManagement() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let active = true;

    obtenerClientes(() => active)
      .then((data) => {
        if (!active) return;
        setClientes(data);
      })
      .catch((requestError) => {
        if (!active) return;

        setClientes([]);

        setError(
          requestError.status === 403
            ? "No tienes permisos para consultar clientes."
            : requestError.message ||
              "No se pudo cargar la información de los clientes."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  // Búsqueda local por nombre, correo o teléfono.
  const filteredClientes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clientes;

    return clientes.filter((cliente) =>
      [cliente.nombre, cliente.email, cliente.telefono]
        .some((value) =>
          String(value || "").toLowerCase().includes(term)
        )
    );
  }, [clientes, search]);

  const pages = Math.max(
    1,
    Math.ceil(filteredClientes.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, pages);

  const visibleClientes = filteredClientes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function reload() {
    setLoading(true);
    setError("");
    setPage(1);
    setExpandedId(null);
    setRetryKey((value) => value + 1);
  }

  function changeSearch(event) {
    setSearch(event.target.value);
    setPage(1);
    setExpandedId(null);
  }

  function goToPage(nextPage) {
    setPage(nextPage);
    setExpandedId(null);
  }

  return (
    <section className="admin-page admin-customers">
      <Link to="/admin" className="admin-customers-back">
        <ArrowLeft size={17} />
        Volver al panel
      </Link>

      <div className="admin-customers-heading">
        <div>
          <span className="eyebrow">
            TECORP STORE / ADMINISTRACIÓN
          </span>

          <h1>Gestión de clientes</h1>

          <p>
            Consulta la información de contacto de los
            clientes de TECORP.
          </p>
        </div>

        <button
          type="button"
          className="admin-customers-button"
          onClick={reload}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading ? "admin-customers-spin" : ""
            }
          />

          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="admin-customers-stats">
        <article className="admin-customers-stat">
          <div className="admin-customers-stat-icon">
            <Users size={24} />
          </div>

          <div className="admin-customers-stat-content">
            <span>Clientes identificados</span>

            <strong>
              {loading || error ? "—" : clientes.length}
            </strong>

            <p>Usuarios con pedidos registrados</p>
          </div>
        </article>
      </div>

      <div className="admin-customers-panel">
        <div className="admin-customers-toolbar">
          <div className="admin-customers-table-heading">
            <h2>Listado de clientes</h2>

            <p>
              {loading
                ? "Cargando clientes..."
                : error
                  ? "No se pudo consultar el listado"
                  : `${filteredClientes.length} ${
                      filteredClientes.length === 1
                        ? "cliente encontrado"
                        : "clientes encontrados"
                    }`}
            </p>
          </div>

          <div className="admin-customers-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar cliente..."
              aria-label="Buscar por nombre, correo o teléfono"
              value={search}
              onChange={changeSearch}
              disabled={loading}
            />
          </div>
        </div>

        {loading && (
          <div
            className="admin-customers-empty"
            role="status"
          >
            <RefreshCw
              size={36}
              className="admin-customers-spin"
            />
            <h2>Cargando clientes...</h2>
            <p>
              Consultando la información disponible.
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className="admin-customers-empty"
            role="alert"
          >
            <h2>No se pudieron cargar los clientes</h2>
            <p>{error}</p>

            <button
              type="button"
              className="admin-customers-button"
              onClick={reload}
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredClientes.length === 0 && (
            <div className="admin-customers-empty">
              <Users size={42} />

              <h2>No hay clientes para mostrar</h2>

              <p>
                {search.trim()
                  ? "No se encontraron coincidencias con tu búsqueda."
                  : "Todavía no hay usuarios con pedidos registrados."}
              </p>

              {search.trim() && (
                <button
                  type="button"
                  className="admin-customers-button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          visibleClientes.length > 0 && (
            <div className="admin-customers-table-wrapper">
              <table className="admin-customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre completo</th>
                    <th>Correo electrónico</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleClientes.map((cliente) => {
                    const isExpanded =
                      expandedId === String(cliente.id);

                    return (
                      <Fragment key={cliente.id}>
                        <tr>
                          <td>
                            <strong className="admin-customer-id">
                              {cliente.id}
                            </strong>
                          </td>

                          <td>
                            <div className="admin-customer-name">
                              <div className="admin-customer-avatar">
                                <UserRound size={19} />
                              </div>

                              <strong>
                                {cliente.nombre || "Sin nombre"}
                              </strong>
                            </div>
                          </td>

                          <td>
                            {cliente.email || "No disponible"}
                          </td>

                          <td>
                            {cliente.telefono || "No disponible"}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-customers-button admin-customer-detail-button"
                              aria-expanded={isExpanded}
                              aria-controls={`customer-detail-${cliente.id}`}
                              onClick={() =>
                                setExpandedId(
                                  isExpanded
                                    ? null
                                    : String(cliente.id)
                                )
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}

                              {isExpanded ? "Ocultar" : "Ver"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="admin-customer-detail-row">
                            <td colSpan={5}>
                              <div
                                id={`customer-detail-${cliente.id}`}
                                className="admin-customer-detail"
                              >
                                <div className="admin-customer-detail-heading">
                                  <UserRound size={21} />
                                  <h3>Información del cliente</h3>
                                </div>

                                <div className="admin-customer-detail-grid">
                                  <div>
                                    <span>ID del usuario</span>
                                    <strong>{cliente.id}</strong>
                                  </div>

                                  <div>
                                    <span>Nombre completo</span>
                                    <strong>
                                      {cliente.nombre || "No disponible"}
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Correo electrónico</span>
                                    <strong>
                                      {cliente.email || "No disponible"}
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Teléfono</span>
                                    <strong>
                                      {cliente.telefono || "No disponible"}
                                    </strong>
                                  </div>

                                  <div className="admin-customer-address">
                                    <span>
                                      Última dirección de envío
                                    </span>

                                    <strong>
                                      {cliente.direccion || "No disponible"}
                                    </strong>
                                  </div>
                                </div>
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
            className="admin-customers-pagination"
            aria-label="Paginación de clientes"
          >
            <button
              type="button"
              className="admin-customers-button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Anterior
            </button>

            <span>
              Página {currentPage} de {pages}
            </span>

            <button
              type="button"
              className="admin-customers-button"
              disabled={currentPage >= pages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Siguiente
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
