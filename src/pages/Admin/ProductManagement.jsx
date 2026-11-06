import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Package,
  Boxes,
  AlertTriangle,
  Ban,
  SlidersHorizontal,
} from "lucide-react";
import {
  getProducts,
  saveProducts,
} from "../../services/productService";

const CATEGORIES = [
  "Accesorios",
  "Laptops",
  "Monitores",
  "Componentes",
  "Periféricos",
];

const EMPTY_FORM = {
  name: "",
  category: "Accesorios",
  price: "",
  stock: "",
};

const STOCK_LIMIT = 5;

export default function ProductManagement() {
  const [products, setProducts] = useState(() => getProducts());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [stockFilter, setStockFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= STOCK_LIMIT
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock === 0
  ).length;

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.category}`
        .toLocaleLowerCase("es")
        .includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "Todas" ||
        product.category === categoryFilter;

      let matchesStock = true;

      if (stockFilter === "Disponible") {
        matchesStock = product.stock > STOCK_LIMIT;
      } else if (stockFilter === "Poco stock") {
        matchesStock =
          product.stock > 0 && product.stock <= STOCK_LIMIT;
      } else if (stockFilter === "Agotado") {
        matchesStock = product.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  function openNewProduct() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  }

  function openEditProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (name.length < 3) {
      setFormError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (!Number.isFinite(price) || price < 0 || form.price === "") {
      setFormError("Ingresa un precio válido mayor o igual a cero.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setFormError("El stock debe ser un número entero igual o mayor a cero.");
      return;
    }

    const productData = {
      name,
      category: form.category,
      price,
      stock,
    };

    if (editingId !== null) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? { ...product, ...productData }
            : product
        )
      );
    } else {
      setProducts((current) => [
        ...current,
        {
          id: Date.now(),
          ...productData,
        },
      ]);
    }

    closeForm();
  }

  function deleteProduct(product) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    );
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("Todas");
    setStockFilter("Todos");
  }

  function getStockLabel(stock) {
    if (stock === 0) return "Agotado";
    if (stock <= STOCK_LIMIT) return "Poco stock";
    return "Disponible";
  }

  function getStockClass(stock) {
    if (stock === 0) return "stock-empty";
    if (stock <= STOCK_LIMIT) return "stock-low";
    return "stock-ok";
  }

  return (
    <section className="admin-page">
      <Link to="/admin" className="back-link">
        <ArrowLeft size={17} />
        Volver al panel
      </Link>

      <div className="admin-heading">
        <span className="eyebrow">TECORP STORE / INVENTARIO</span>
        <h1>Gestión de productos</h1>
        <p>
          Administra el catálogo, controla los precios y supervisa
          el inventario de la tienda.
        </p>
      </div>

      <div className="product-admin-toolbar">
        <div className="product-admin-search">
          <Search size={19} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o categoría..."
            aria-label="Buscar productos"
          />
        </div>

        <button
          type="button"
          className="primary-button product-create-button"
          onClick={openNewProduct}
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      <div className="product-admin-summary">
        <div className="product-summary-card">
          <div className="product-summary-icon">
            <Package size={21} />
          </div>
          <span>Total de productos</span>
          <strong>{products.length}</strong>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon">
            <Boxes size={21} />
          </div>
          <span>Unidades en inventario</span>
          <strong>{totalUnits}</strong>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon warning">
            <AlertTriangle size={21} />
          </div>
          <span>Productos con poco stock</span>
          <strong>{lowStockCount}</strong>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon danger">
            <Ban size={21} />
          </div>
          <span>Productos agotados</span>
          <strong>{outOfStockCount}</strong>
        </div>
      </div>

      <div className="product-admin-panel">
        <div className="product-admin-panel-heading">
          <div>
            <h2>Inventario de productos</h2>
            <p>
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          </div>
          <SlidersHorizontal size={20} />
        </div>

        <div className="product-admin-filters">
          <label>
            <span>Categoría</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Disponibilidad</span>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Poco stock">Poco stock</option>
              <option value="Agotado">Agotado</option>
            </select>
          </label>

          <button
            type="button"
            className="product-clear-filters"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="product-admin-table-wrapper">
          <table className="product-admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong className="product-table-name">
                      {product.name}
                    </strong>
                  </td>
                  <td>{product.category}</td>
                  <td className="product-table-price">
                    S/ {Number(product.price).toFixed(2)}
                  </td>
                  <td>{product.stock} unidades</td>
                  <td>
                    <span className={`stock-status ${getStockClass(product.stock)}`}>
                      {getStockLabel(product.stock)}
                    </span>
                  </td>
                  <td>
                    <div className="product-admin-actions">
                      <button
                        type="button"
                        className="icon-action edit-action"
                        onClick={() => openEditProduct(product)}
                        aria-label={`Editar ${product.name}`}
                        title="Editar producto"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="icon-action delete-action"
                        onClick={() => deleteProduct(product)}
                        aria-label={`Eliminar ${product.name}`}
                        title="Eliminar producto"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-products">
                    <Package size={30} />
                    <strong>No se encontraron productos</strong>
                    <span>
                      Prueba con otra búsqueda o modifica los filtros.
                    </span>
                    <button
                      type="button"
                      className="product-clear-filters"
                      onClick={clearFilters}
                    >
                      Limpiar búsqueda y filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-heading">
              <div>
                <span className="eyebrow">TECORP STORE / INVENTARIO</span>
                <h2 id="product-modal-title">
                  {editingId !== null ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p>
                  Completa los datos para mantener actualizado el inventario.
                </p>
              </div>

              <button
                type="button"
                className="icon-action"
                onClick={closeForm}
                aria-label="Cerrar formulario"
                title="Cerrar"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="product-name">Nombre del producto</label>
              <input
                id="product-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Ej. Laptop ASUS VivoBook"
                maxLength={100}
                required
              />

              <label htmlFor="product-category">Categoría</label>
              <select
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor="product-price">Precio (S/)</label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleFormChange}
                placeholder="Ej. 1299.90"
                required
              />

              <label htmlFor="product-stock">Stock disponible</label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleFormChange}
                placeholder="Ej. 10"
                required
              />

              {formError && (
                <p className="product-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="product-modal-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary-button">
                  {editingId !== null ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}