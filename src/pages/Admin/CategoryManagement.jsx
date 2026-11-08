import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import {
  actualizar,
  crear,
  eliminar,
  listar,
} from "../../services/categoriaService";

const EMPTY_FORM = { nombre: "", descripcion: "" };

function groupDetails(details = []) {
  return details.reduce((grouped, detail) => {
    if (!detail?.campo || !detail?.mensaje) return grouped;
    return {
      ...grouped,
      [detail.campo]: [...(grouped[detail.campo] || []), detail.mensaje],
    };
  }, {});
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    listar()
      .then((response) => {
        if (active) setCategories(Array.isArray(response) ? response : []);
      })
      .catch((error) => {
        if (active) setPageError(error.message || "No se pudieron cargar las categorías.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshCategories() {
    setLoading(true);
    setPageError("");

    try {
      const response = await listar();
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      setPageError(error.message || "No se pudieron actualizar las categorías.");
    } finally {
      setLoading(false);
    }
  }

  function openNewCategory() {
    setEditingCategory(null);
    setOriginalForm(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function openEditCategory(category) {
    const categoryForm = {
      nombre: category.nombre || "",
      descripcion: category.descripcion || "",
    };
    setEditingCategory(category);
    setOriginalForm(categoryForm);
    setForm(categoryForm);
    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategory(null);
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

    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const errors = {};

    if (nombre.length < 2 || nombre.length > 100) {
      errors.nombre = ["El nombre debe tener entre 2 y 100 caracteres."];
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let payload = { nombre, descripcion };

    if (editingCategory) {
      payload = Object.fromEntries(
        Object.entries(payload).filter(
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
      if (editingCategory) {
        await actualizar(editingCategory.id, payload);
      } else {
        await crear(payload);
      }

      closeForm();
      setNotice({
        type: "success",
        message: editingCategory
          ? "Categoría actualizada correctamente."
          : "Categoría creada correctamente.",
      });
      await refreshCategories();
    } catch (error) {
      setFormError(error.message || "No se pudo guardar la categoría.");
      setFieldErrors(groupDetails(error.detalles));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `¿Deseas eliminar la categoría "${category.nombre}"?`
    );
    if (!confirmed) return;

    setNotice(null);

    try {
      await eliminar(category.id);
      setNotice({ type: "success", message: "Categoría eliminada correctamente." });
      await refreshCategories();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.status === 409
            ? "No se puede eliminar: la categoría tiene productos asociados"
            : error.message || "No se pudo eliminar la categoría.",
      });
    }
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
        <span className="eyebrow">TECORP STORE / CATEGORÍAS</span>
        <h1>Gestión de categorías</h1>
        <p>Organiza las categorías disponibles en el catálogo.</p>
      </div>

      {notice && (
        <p className={notice.type === "error" ? "product-form-error" : "stock-ok"} role="status">
          {notice.message}
        </p>
      )}

      <div className="product-admin-toolbar">
        <div />
        <button type="button" className="primary-button product-create-button" onClick={openNewCategory}>
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      <div className="product-admin-panel">
        <div className="product-admin-panel-heading">
          <div>
            <h2>Categorías</h2>
            <p>{categories.length} categorías registradas</p>
          </div>
          <Tags size={20} />
        </div>

        {loading && <p>Cargando categorías...</p>}
        {!loading && pageError && (
          <div className="empty-products" role="alert">
            <strong>{pageError}</strong>
            <button className="product-clear-filters" onClick={refreshCategories}>Reintentar</button>
          </div>
        )}

        {!loading && !pageError && (
          <div className="product-admin-table-wrapper">
            <table className="product-admin-table">
              <thead><tr><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td><strong className="product-table-name">{category.nombre}</strong></td>
                    <td>{category.descripcion || "Sin descripción"}</td>
                    <td>
                      <div className="product-admin-actions">
                        <button type="button" className="icon-action edit-action" onClick={() => openEditCategory(category)} aria-label={`Editar ${category.nombre}`}>
                          <Pencil size={17} />
                        </button>
                        <button type="button" className="icon-action delete-action" onClick={() => deleteCategory(category)} aria-label={`Eliminar ${category.nombre}`}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan="3" className="empty-products"><Tags size={30} /><strong>No hay categorías registradas</strong></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="product-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
            <div className="product-modal-heading">
              <div>
                <span className="eyebrow">TECORP STORE / CATEGORÍAS</span>
                <h2 id="category-modal-title">{editingCategory ? "Editar categoría" : "Nueva categoría"}</h2>
              </div>
              <button type="button" className="icon-action" onClick={closeForm} aria-label="Cerrar formulario"><X size={19} /></button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="category-name">Nombre</label>
              <input id="category-name" name="nombre" value={form.nombre} onChange={handleChange} minLength="2" maxLength="100" required />
              {renderFieldErrors("nombre")}

              <label htmlFor="category-description">Descripción</label>
              <textarea id="category-description" name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" />
              {renderFieldErrors("descripcion")}

              {formError && <p className="product-form-error" role="alert">{formError}</p>}

              <div className="product-modal-buttons">
                <button type="button" className="cancel-button" onClick={closeForm}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Guardando..." : editingCategory ? "Guardar cambios" : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
