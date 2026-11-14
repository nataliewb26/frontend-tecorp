import StoreNavbar from "./components/layout/StoreNavbar";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { getProductos } from "./services/productService";
import { listar as listarCategorias } from "./services/categoriaService";
import { formatMoney } from "./utils/formatters";

const FALLBACK_IMAGE = "/product-placeholder.svg";
const PAGE_SIZE = 8;

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key]);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [categoriesRetryKey, setCategoriesRetryKey] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setCategoriesError("");

      try {
        const data = await listarCategorias();
        if (active) setCategories(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (active) {
          setCategoriesError(
            requestError.message || "No se pudieron cargar las categorías."
          );
        }
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, [categoriesRetryKey]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await getProductos({
          categoria: activeCategory || undefined,
          q: debouncedSearch || undefined,
          pagina: page,
          limite: PAGE_SIZE,
        });

        if (!active) return;

        setProducts(response.datos);
        setTotal(Number(response.total) || 0);
        setPages(Math.max(1, Number(response.paginas) || 1));
      } catch (requestError) {
        if (!active) return;
        setProducts([]);
        setTotal(0);
        setPages(1);
        setError(requestError.message || "No se pudieron cargar los productos.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [activeCategory, debouncedSearch, page, retryKey]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2500);
  }

  function handleAddToCart(product) {
    const currentItem = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    if (Number(product.stock) <= 0) return;

    if (currentItem && currentItem.quantity >= Number(product.stock)) {
      showToast(`No hay más stock disponible de ${product.name}`);
      return;
    }

    addToCart(product);
    showToast(`${product.name} agregado al carrito`);
  }

  function changeQuantity(id, amount) {
    const item = cart.find((product) => product.id === id);

    if (!item) return;

    updateQuantity(id, item.quantity + amount);
  }

  function scrollToCatalog() {
    document.getElementById("catalogo")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function goToCheckout() {
    setCartOpen(false);

    if (cart.length === 0) {
      showToast("Tu carrito está vacío");
      return;
    }

    navigate("/checkout");
  }

  return (
    <div className="store">
      <StoreNavbar onOpenCart={() => setCartOpen(true)} />

      <main>
        <section className="hero" id="inicio">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />

          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> EL FUTURO ESTÁ AQUÍ
            </span>

            <h1>
              La tecnología
              <br />
              que <span>impulsa</span> tu mundo.
            </h1>

            <p>
              Descubre equipos, componentes y accesorios seleccionados
              para llevar tu experiencia al siguiente nivel.
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={scrollToCatalog}>
                Explorar catálogo <span>→</span>
              </button>

              <a className="text-link" href="#beneficios">
                Conoce TECORP <span>↗</span>
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Tech</strong>
                <span>Productos seleccionados</span>
              </div>
              <div>
                <strong>Perú</strong>
                <span>Envíos nacionales</span>
              </div>
              <div>
                <strong>Online</strong>
                <span>Compra desde donde estés</span>
              </div>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Equipos tecnológicos destacados"
          >
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="hero-device laptop-device">
              <div className="laptop-screen">
                <span>
                  TEC<span>●</span>
                </span>
                <small>POWER YOUR WORLD</small>
              </div>
              <div className="laptop-base" />
            </div>

            <div className="floating-card floating-top">
              <span className="floating-icon">⚡</span>
              <span>
                <strong>Alto rendimiento</strong>
                <small>Potencia sin límites</small>
              </span>
            </div>

            <div className="floating-card floating-bottom">
              <span className="floating-icon">✦</span>
              <span>
                <strong>Ofertas especiales</strong>
                <small>Precios que sorprenden</small>
              </span>
            </div>

            <div className="visual-caption">
              INNOVACIÓN · CALIDAD · CONFIANZA
            </div>
          </div>
        </section>

        <section className="benefits" id="beneficios">
          <div className="benefit-item">
            <span>🚚</span>
            <div>
              <strong>Envíos a nivel nacional</strong>
              <small>Recibe tu compra donde estés</small>
            </div>
          </div>

          <div className="benefit-item">
            <span>🛡️</span>
            <div>
              <strong>Compra protegida</strong>
              <small>Tu seguridad es prioridad</small>
            </div>
          </div>

          <div className="benefit-item">
            <span>💬</span>
            <div>
              <strong>Atención personalizada</strong>
              <small>Estamos aquí para ayudarte</small>
            </div>
          </div>

          <div className="benefit-item">
            <span>⚙️</span>
            <div>
              <strong>Calidad garantizada</strong>
              <small>Productos seleccionados</small>
            </div>
          </div>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                ENCUENTRA LO QUE BUSCAS
              </span>
              <h2>
                Explora nuestro <span>catálogo.</span>
              </h2>
              <p>La tecnología ideal para trabajar, crear y jugar.</p>
            </div>

            <span className="product-total">
              {total} productos
            </span>
          </div>

          <div className="catalog-toolbar">
            <div className="category-list">
              <button
                className={
                  activeCategory === ""
                    ? "category-chip selected"
                    : "category-chip"
                }
                onClick={() => {
                  setActiveCategory("");
                  setPage(1);
                }}
              >
                Todos
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    String(activeCategory) === String(category.id)
                      ? "category-chip selected"
                      : "category-chip"
                  }
                  onClick={() => {
                    setActiveCategory(category.id);
                    setPage(1);
                  }}
                >
                  {category.nombre}
                </button>
              ))}
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>

          {categoriesError && (
            <div className="empty-results" role="alert">
              <p>{categoriesError}</p>
              <button
                className="category-chip"
                onClick={() => setCategoriesRetryKey((value) => value + 1)}
              >
                Reintentar categorías
              </button>
            </div>
          )}

          {loading && (
            <div className="empty-results" role="status">
              <h3>Cargando productos...</h3>
              <p>Estamos preparando el catálogo.</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-results" role="alert">
              <h3>No pudimos cargar los productos</h3>
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => setRetryKey((value) => value + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-art blue">
                  <span className="product-tag">
                    {Number(product.stock) <= 0 ? "AGOTADO" : `${product.stock} EN STOCK`}
                  </span>
                  <img
                    className="product-image"
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <span className="art-orbit" />

                  <button
                    className="quick-add"
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Agregar ${product.name} al carrito`}
                    disabled={Number(product.stock) <= 0}
                  >
                    +
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>
                    <Link
                      to={`/producto/${product.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <div>
                      <strong className="product-price">
                        {formatMoney(product.price)}
                      </strong>

                    </div>

                    <button
                      className="add-button"
                      onClick={() => handleAddToCart(product)}
                      disabled={Number(product.stock) <= 0}
                    >
                      {Number(product.stock) <= 0 ? "Agotado" : "Agregar"}
                      {Number(product.stock) > 0 && <span>+</span>}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty-results">
              <span>🔎</span>
              <h3>No encontramos productos</h3>
              <p>
                Prueba con otra búsqueda o selecciona una categoría diferente.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("");
                  setPage(1);
                }}
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {!loading && !error && pages > 1 && (
            <nav className="catalog-pagination" aria-label="Paginación del catálogo">
              <button
                className="category-chip"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>

              {Array.from({ length: pages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    className={
                      page === pageNumber
                        ? "category-chip selected"
                        : "category-chip"
                    }
                    onClick={() => setPage(pageNumber)}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              )}

              <button
                className="category-chip"
                disabled={page >= pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
              >
                Siguiente
              </button>
            </nav>
          )}
        </section>

        <section className="promo-banner">
          <div>
            <span className="section-kicker">DA EL SIGUIENTE PASO</span>
            <h2>
              Tu próximo setup
              <br />
              comienza en <span>TECORP.</span>
            </h2>
            <p>
              Encuentra las herramientas que necesitas para destacar.
            </p>
            <button className="primary-button" onClick={scrollToCatalog}>
              Ver productos <span>→</span>
            </button>
          </div>

          <div className="promo-symbol">
            T<span>✦</span>
          </div>
        </section>
      </main>

      <footer className="footer" id="contacto">
        <div className="footer-main">
          <div>
            <Link className="brand footer-brand" to="/">
              <span className="brand-mark">T</span>
              <span>
                TECORP<span className="brand-light"> STORE</span>
              </span>
            </Link>

            <p>
              Conectamos personas con tecnología.
              <br />
              Innovación para cada momento.
            </p>
          </div>

          <div>
            <strong>Explora</strong>
            <Link to="/">Inicio</Link>
            <a href="#catalogo">Catálogo</a>
            <a href="#beneficios">Nosotros</a>
          </div>

          <div>
            <strong>Atención</strong>
            <a href="#contacto">Contáctanos</a>
            <a href="#contacto">Preguntas frecuentes</a>
            <a href="#contacto">Términos y condiciones</a>
          </div>

          <div>
            <strong>Contacto</strong>
            <span>Perú</span>
            <span>Atención online</span>
            <span>soporte@tecorp.store</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TECORP STORE. Todos los derechos reservados.</span>
          <span>Proyecto académico · SENATI</span>
        </div>
      </footer>

      {cartOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Carrito de compras"
          >
            <div className="drawer-header">
              <div>
                <span className="section-kicker">TU COMPRA</span>
                <h2>
                  Mi carrito <span>({totalItems})</span>
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() => setCartOpen(false)}
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>🛒</span>
                <h3>Tu carrito está vacío</h3>
                <p>
                  Explora el catálogo y encuentra tu próximo producto.
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollToCatalog();
                  }}
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-art blue">
                        <img
                          src={item.image || FALLBACK_IMAGE}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{formatMoney(item.price)}</span>

                        <div className="quantity-control">
                          <button
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label="Aumentar cantidad"
                            disabled={item.quantity >= Number(item.stock)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Eliminar ${item.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatMoney(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Envío</span>
                    <span>Por calcular</span>
                  </div>

                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{formatMoney(subtotal)}</strong>
                  </div>

                  <button
                    className="primary-button checkout-button"
                    onClick={goToCheckout}
                  >
                    Continuar compra <span>→</span>
                  </button>

                  <small>
                    El costo de envío se calculará al confirmar tu pedido.
                  </small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {toast && (
        <div className="toast-message" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
