import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Boxes,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  getProductos,
} from "../../services/productService";
import { listar as listarCategorias } from "../../services/categoriaService";

const EMPTY_FORM = {
  nombre: "",
  marca: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoria_id: "",
  imagen_url: "",
};

const STOCK_LIMIT = 5;

function validateProduct(form) {
  const errors = {};
  const nombre = form.nombre.trim();
  const precio = Number(form.precio);
  const stock = Number(form.stock);

  if (nombre.length < 2 || nombre.length > 150) {
    errors.nombre = ["El nombre debe tener entre 2 y 150 caracteres."];
  }

  if (form.precio === "" || !Number.isFinite(precio) || precio < 0) {
    errors.precio = ["El precio debe ser mayor o igual a cero."];
  }

  if (form.stock === "" || !Number.isInteger(stock) || stock < 0) {
    errors.stock = ["El stock debe ser un entero mayor o igual a cero."];
  }

  if (!form.categoria_id) {
    errors.categoria_id = ["Selecciona una categoría."];
  }

  if (!/^https?:\/\/\S+$/i.test(form.imagen_url.trim())) {
    errors.imagen_url = ["La imagen debe ser una URL http(s) válida."];
  }

  return errors;
}

function groupDetails(details = []) {
  return details.reduce((grouped, detail) => {
    if (!detail?.campo || !detail?.mensaje) return grouped;
    return {
      ...grouped,
      [detail.campo]: [...(grouped[detail.campo] || []), detail.mensaje],
    };
  }, {});
}

function normalizeForm(form) {
  return {
    nombre: form.nombre.trim(),
    marca: form.marca.trim(),
    descripcion: form.descripcion.trim(),
    precio: Number(form.precio),
    stock: Number(form.stock),
    categoria_id: Number(form.categoria_id),
    imagen_url: form.imagen_url.trim(),
  };
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      getProductos({ pagina: 1, limite: 100 }),
      listarCategorias(),
    ])
      .then(([productResponse, categoryResponse]) => {
        if (!active) return;
        setProducts(productResponse.datos);
        setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
      })
      .catch((error) => {
        if (active) setPageError(error.message || "No se pudo cargar el inventario.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshData() {
    setLoading(true);
    setPageError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        getProductos({ pagina: 1, limite: 100 }),
        listarCategorias(),
      ]);
      setProducts(productResponse.datos);
      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
    } catch (error) {
      setPageError(error.message || "No se pudo actualizar el inventario.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    if (!term) return products;

    return products.filter((product) =>
      `${product.name} ${product.brand || ""} ${product.category}`
        .toLocaleLowerCase("es")
        .includes(term)
    );
  }, [products, search]);

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= STOCK_LIMIT
  ).length;
  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  function openNewProduct() {
    const initialForm = {
      ...EMPTY_FORM,
      categoria_id: categories[0] ? String(categories[0].id) : "",
    };
    setEditingProduct(null);
    setOriginalForm(null);
    setForm(initialForm);
    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function openEditProduct(product) {
    const productForm = {
      nombre: product.nombre || product.name || "",
      marca: product.marca || "",
      descripcion: product.descripcion || "",
      precio: String(product.precio ?? product.price ?? ""),
      stock: String(product.stock ?? ""),
      categoria_id: String(product.categoria_id ?? ""),
      imagen_url: product.imagen_url || "",
    };

    setEditingProduct(product);
    setOriginalForm(normalizeForm(productForm));
    setForm(productForm);
    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
    setOriginalForm(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: [] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice(null);

    const validationErrors = validateProduct(form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const normalized = normalizeForm(form);
    let payload = normalized;

    if (editingProduct) {
      payload = Object.fromEntries(
        Object.entries(normalized).filter(
          ([field, value]) => value !== originalForm[field]
        )
      );

      if (Object.keys(payload).length === 0) {
        setFormError("No hay cambios para guardar.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (editingProduct) {
        await actualizarProducto(editingProduct.id, payload);
      } else {
        await crearProducto(payload);
      }

      closeForm();
      setNotice({
        type: "success",
        message: editingProduct
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      });
      await refreshData();
    } catch (error) {
      setFormError(error.message || "No se pudo guardar el producto.");
      setFieldErrors(groupDetails(error.detalles));
    } finally {
      setSubmitting(false);
    }
  }

  async function deactivateProduct(product) {
    const confirmed = window.confirm(
      `¿Deseas desactivar "${product.name}"? Dejará de aparecer en la tienda.`
    );
    if (!confirmed) return;

    setNotice(null);

    try {
      await eliminarProducto(product.id);
      setNotice({ type: "success", message: "Producto desactivado correctamente." });
      await refreshData();
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "No se pudo desactivar el producto.",
      });
    }
  }

  function getStockLabel(stock) {
    if (Number(stock) === 0) return "Agotado";
    if (Number(stock) <= STOCK_LIMIT) return "Poco stock";
    return "Disponible";
  }

  function getStockClass(stock) {
    if (Number(stock) === 0) return "stock-empty";
    if (Number(stock) <= STOCK_LIMIT) return "stock-low";
    return "stock-ok";
  }

  function renderFieldErrors(field) {
    return (fieldErrors[field] || []).map((message) => (
      <p className="product-form-error" role="alert" key={message}>
        {message}
      </p>
    ));
  }

  return (
    <section className="admin-page">
      <Link to="/admin" className="back-link">
        <ArrowLeft size={17} /> Volver al panel
      </Link>

      <div className="admin-heading">
        <span className="eyebrow">TECORP STORE / INVENTARIO</span>
        <h1>Gestión de productos</h1>
        <p>Administra el catálogo conectado a la API.</p>
      </div>

      {notice && (
        <p className={notice.type === "error" ? "product-form-error" : "stock-ok"} role="status">
          {notice.message}
        </p>
      )}

      <div className="product-admin-toolbar">
        <div className="product-admin-search">
          <Search size={19} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, marca o categoría..."
            aria-label="Buscar productos"
          />
        </div>
        <button
          type="button"
          className="primary-button product-create-button"
          onClick={openNewProduct}
          disabled={categories.length === 0}
        >
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      <div className="product-admin-summary">
        <div className="product-summary-card">
          <Package size={21} /><span>Productos activos</span><strong>{products.length}</strong>
        </div>
        <div className="product-summary-card">
          <Boxes size={21} /><span>Unidades en inventario</span><strong>{totalUnits}</strong>
        </div>
        <div className="product-summary-card">
          <AlertTriangle size={21} /><span>Con poco stock</span><strong>{lowStockCount}</strong>
        </div>
        <div className="product-summary-card">
          <Ban size={21} /><span>Agotados</span><strong>{outOfStockCount}</strong>
        </div>
      </div>

      <div className="product-admin-panel">
        <div className="product-admin-panel-heading">
          <div>
            <h2>Inventario de productos</h2>
            <p>Mostrando {filteredProducts.length} de {products.length} productos</p>
          </div>
        </div>

        {loading && <p>Cargando productos...</p>}
        {!loading && pageError && (
          <div className="empty-products" role="alert">
            <strong>{pageError}</strong>
            <button className="product-clear-filters" onClick={refreshData}>Reintentar</button>
          </div>
        )}

        {!loading && !pageError && (
          <div className="product-admin-table-wrapper">
            <table className="product-admin-table">
              <thead>
                <tr>
                  <th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td><strong className="product-table-name">{product.name}</strong><span>{product.brand}</span></td>
                    <td>{product.category}</td>
                    <td className="product-table-price">S/ {Number(product.price).toFixed(2)}</td>
                    <td>{product.stock} unidades</td>
                    <td><span className={`stock-status ${getStockClass(product.stock)}`}>{getStockLabel(product.stock)}</span></td>
                    <td>
                      <div className="product-admin-actions">
                        <button type="button" className="icon-action edit-action" onClick={() => openEditProduct(product)} aria-label={`Editar ${product.name}`}>
                          <Pencil size={17} />
                        </button>
                        <button type="button" className="icon-action delete-action" onClick={() => deactivateProduct(product)} aria-label={`Desactivar ${product.name}`}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan="6" className="empty-products"><Package size={30} /><strong>No hay productos para mostrar</strong></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="product-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="product-modal-heading">
              <div>
                <span className="eyebrow">TECORP STORE / INVENTARIO</span>
                <h2 id="product-modal-title">{editingProduct ? "Editar producto" : "Nuevo producto"}</h2>
              </div>
              <button type="button" className="icon-action" onClick={closeForm} aria-label="Cerrar formulario"><X size={19} /></button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="product-name">Nombre</label>
              <input id="product-name" name="nombre" value={form.nombre} onChange={handleChange} maxLength={150} required />
              {renderFieldErrors("nombre")}

              <label htmlFor="product-brand">Marca</label>
              <input id="product-brand" name="marca" value={form.marca} onChange={handleChange} />
              {renderFieldErrors("marca")}

              <label htmlFor="product-description">Descripción</label>
              <textarea id="product-description" name="descripcion" value={form.descripcion} onChange={handleChange} rows="3" />
              {renderFieldErrors("descripcion")}

              <label htmlFor="product-category">Categoría</label>
              <select id="product-category" name="categoria_id" value={form.categoria_id} onChange={handleChange} required>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
              </select>
              {renderFieldErrors("categoria_id")}

              <label htmlFor="product-price">Precio (S/)</label>
              <input id="product-price" name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} required />
              {renderFieldErrors("precio")}

              <label htmlFor="product-stock">Stock</label>
              <input id="product-stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
              {renderFieldErrors("stock")}

              <label htmlFor="product-image">URL de imagen</label>
              <input id="product-image" name="imagen_url" type="url" value={form.imagen_url} onChange={handleChange} placeholder="https://..." required />
              {renderFieldErrors("imagen_url")}

              {formError && <p className="product-form-error" role="alert">{formError}</p>}

              <div className="product-modal-buttons">
                <button type="button" className="cancel-button" onClick={closeForm}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
