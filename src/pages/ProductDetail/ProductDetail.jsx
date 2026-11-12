import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getProducto } from "../../services/productService";
import { formatMoneyWithCents as money } from "../../utils/formatters";

const FALLBACK_IMAGE = "/product-placeholder.svg";
// [SIN USO] Formateador duplicado; se usa formatMoneyWithCents compartido.
// const money = (value) =>
//   new Intl.NumberFormat("es-PE", {
//     style: "currency",
//     currency: "PEN",
//     maximumFractionDigits: 2,
//   }).format(Number(value) || 0);

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    getProducto(id)
      .then((response) => {
        if (active) setProduct(response);
      })
      .catch((requestError) => {
        if (!active) return;

        setProduct(null);

        if (requestError.status === 404) {
          setNotFound(true);
        } else {
          setError(requestError.message || "No se pudo cargar el producto.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, retryKey]);

  function retry() {
    setLoading(true);
    setError("");
    setNotFound(false);
    setRetryKey((value) => value + 1);
  }

  const outOfStock = Number(product?.stock) <= 0;

  return (
    <section className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} /> Volver a la tienda
      </Link>

      <div className="page-card">
        <span className="eyebrow">TECORP STORE / PRODUCTO</span>

        {loading && <p>Cargando producto...</p>}

        {!loading && notFound && (
          <>
            <h1>Producto no encontrado</h1>
            <p>El producto solicitado no existe o ya no está disponible.</p>
          </>
        )}

        {!loading && error && (
          <>
            <h1>No pudimos cargar el producto</h1>
            <p role="alert">{error}</p>
            <button className="primary-button" onClick={retry}>
              Reintentar
            </button>
          </>
        )}

        {!loading && product && (
          <>
            <img
              src={product.image || FALLBACK_IMAGE}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
              style={{ width: "100%", maxHeight: 360, objectFit: "contain" }}
            />
            <span>{product.category}</span>
            <h1>{product.name}</h1>
            <p>{product.description || "Sin descripción disponible."}</p>
            <p><strong>{money(product.price)}</strong></p>
            <p>
              {outOfStock
                ? "Agotado"
                : `${product.stock} unidades disponibles`}
            </p>
            <button
              className="primary-button"
              onClick={() => addToCart(product)}
              disabled={outOfStock}
            >
              <ShoppingCart size={18} />
              {outOfStock ? "Agotado" : "Agregar al carrito"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
