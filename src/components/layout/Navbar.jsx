import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, UserRound, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { usuario, esAdmin, estaAutenticado, logout } = useAuth();

  return (
    <header className="site-navbar">
      <Link to="/" className="brand-logo">
        <span>TEC</span>ORP
        <small>STORE</small>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/">Inicio</NavLink>
        <a href="/#catalogo">Catálogo</a>
        {esAdmin && <NavLink to="/admin">Administración</NavLink>}
      </nav>

      <div className="navbar-actions">
        {estaAutenticado ? (
          <>
            <span>{usuario.nombre}</span>
            <NavLink to="/mis-pedidos" aria-label="Ver mis pedidos">
              <ClipboardList size={20} />
              <span>Mis pedidos</span>
            </NavLink>
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                border: 0,
                background: "none",
                color: "inherit",
                font: "inherit",
                cursor: "pointer",
              }}
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </>
        ) : (
          <Link to="/login" aria-label="Iniciar sesión">
            <UserRound size={20} />
            <span>Ingresar</span>
          </Link>
        )}
        <Link to="/checkout" aria-label="Ir al carrito">
          <ShoppingBag size={20} />
          <span>Carrito</span>
        </Link>
      </div>
    </header>
  );
}
