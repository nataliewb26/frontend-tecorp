import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";

const products = [
  {
    id: 1,
    name: "Laptop ASUS TUF Gaming F15",
    category: "Laptops",
    price: 3299,
    oldPrice: 3699,
    icon: "💻",
    tag: "MÁS VENDIDO",
    color: "purple",
    description: "Intel Core i7 · RTX 4060 · 16 GB RAM",
  },
  {
    id: 2,
    name: "Monitor LG UltraGear 27”",
    category: "Monitores",
    price: 1099,
    oldPrice: 1299,
    icon: "🖥️",
    tag: "OFERTA",
    color: "blue",
    description: "27 pulgadas · 144 Hz · Full HD",
  },
  {
    id: 3,
    name: "Teclado mecánico Redragon",
    category: "Accesorios",
    price: 189,
    oldPrice: null,
    icon: "⌨️",
    tag: "POPULAR",
    color: "orange",
    description: "RGB · Switches mecánicos · USB",
  },
  {
    id: 4,
    name: "Mouse Logitech G502 HERO",
    category: "Accesorios",
    price: 159,
    oldPrice: 199,
    icon: "🖱️",
    tag: "OFERTA",
    color: "green",
    description: "25K DPI · 11 botones programables",
  },
  {
    id: 5,
    name: "Audífonos HyperX Cloud II",
    category: "Audio",
    price: 299,
    oldPrice: null,
    icon: "🎧",
    tag: "RECOMENDADO",
    color: "pink",
    description: "Sonido 7.1 · Micrófono desmontable",
  },
  {
    id: 6,
    name: "PC Gamer Ryzen 7",
    category: "Computadoras",
    price: 4199,
    oldPrice: 4599,
    icon: "🖥️",
    tag: "OFERTA",
    color: "cyan",
    description: "Ryzen 7 · RTX 4060 · 32 GB RAM",
  },
  {
    id: 7,
    name: "SSD Kingston NV2 1TB",
    category: "Componentes",
    price: 279,
    oldPrice: null,
    icon: "💾",
    tag: "ALTO RENDIMIENTO",
    color: "blue",
    description: "NVMe PCIe 4.0 · 3500 MB/s",
  },
  {
    id: 8,
    name: "Silla Gamer ergonómica",
    category: "Accesorios",
    price: 649,
    oldPrice: 799,
    icon: "🪑",
    tag: "OFERTA",
    color: "orange",
    description: "Reclinable · Soporte lumbar · Premium",
  },
];

const categories = [
  "Todos",
  "Laptops",
  "Computadoras",
  "Monitores",
  "Componentes",
  "Accesorios",
  "Audio",
];

const money = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const navigate = useNavigate();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch = `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.toastTimer);
    window.toastTimer = window.setTimeout(() => setToast(""), 2500);
  }

  function handleAddToCart(product) {
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
      <div className="top-strip">
        <span>⚡ TECNOLOGÍA PARA LLEGAR MÁS LEJOS</span>
        <span>Envíos a todo el Perú · Compra segura</span>
      </div>

      <header className="header">
        <Link className="brand" to="/" aria-label="TECORP STORE inicio">
          <span className="brand-mark">T</span>
          <span>
            TECORP<span className="brand-light"> STORE</span>
          </span>
        </Link>

        <nav className="main-nav">
          <Link className="active" to="/">Inicio</Link>
          <a href="#catalogo">Productos</a>
          <a href="#beneficios">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button cart-trigger"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito con ${totalItems} productos`}
          >
            <span>🛒</span>
            <span className="cart-count">{totalItems}</span>
          </button>

          <Link className="login-button" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </header>

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
                <strong>+500</strong>
                <span>Productos</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Calidad garantizada</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Compra online</span>
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
              {filteredProducts.length} productos
            </span>
          </div>

          <div className="catalog-toolbar">
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    activeCategory === category
                      ? "category-chip selected"
                      : "category-chip"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className={`product-art ${product.color}`}>
                  <span className="product-tag">{product.tag}</span>
                  <span className="product-emoji">{product.icon}</span>
                  <span className="art-orbit" />

                  <button
                    className="quick-add"
                    onClick={() => handleAddToCart(product)}
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    +
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <div>
                      <strong className="product-price">
                        {money(product.price)}
                      </strong>

                      {product.oldPrice && (
                        <del>{money(product.oldPrice)}</del>
                      )}
                    </div>

                    <button
                      className="add-button"
                      onClick={() => handleAddToCart(product)}
                    >
                      Agregar <span>+</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
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
                  setActiveCategory("Todos");
                }}
              >
                Ver todos los productos
              </button>
            </div>
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
                      <div className={`cart-item-art ${item.color}`}>
                        {item.icon}
                      </div>

                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{money(item.price)}</span>

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
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Envío</span>
                    <span>Por calcular</span>
                  </div>

                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{money(subtotal)}</strong>
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
