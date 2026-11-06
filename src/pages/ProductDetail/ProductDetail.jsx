import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <section className="page-container">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Volver a la tienda</Link>
      <div className="page-card">
        <span className="eyebrow">TECORP STORE / PRODUCTO</span>
        <h1>Detalle del producto</h1>
        <p>Producto seleccionado: {id}</p>
        <p>En esta sección mostraremos imágenes, descripción, precio y disponibilidad del producto.</p>
        <button className="primary-button" onClick={() => alert("Próximamente: agregar al carrito")}>
          <ShoppingCart size={18} /> Agregar al carrito
        </button>
      </div>
    </section>
  );
}