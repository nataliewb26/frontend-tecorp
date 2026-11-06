import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, UserRound, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  return (
    <header className="site-navbar">
      <Link to="/" className="brand-logo">
        <span>TEC</span>ORP
        <small>STORE</small>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/">Inicio</NavLink>
        <a href="/#catalogo">Catálogo</a>
        <NavLink to="/admin">Administración</NavLink>
      </nav>

      <div className="navbar-actions">
        <Link to="/login" aria-label="Iniciar sesión">
          <UserRound size={20} />
          <span>Ingresar</span>
        </Link>
        <Link to="/checkout" aria-label="Ir al carrito">
          <ShoppingBag size={20} />
          <span>Carrito</span>
        </Link>
      </div>
    </header>
  );
}