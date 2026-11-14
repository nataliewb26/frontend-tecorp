import { ShoppingCart, UserRound, Package, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function StoreNavbar({ onOpenCart }) {
  const { usuario, estaAutenticado, esAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <>
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
          <Link className={isHome && !location.hash ? "active" : undefined} to="/">Inicio</Link>
          <Link to="/#catalogo">Productos</Link>
          <Link to="/#beneficios">Nosotros</Link>
          <Link to="/#contacto">Contacto</Link>
        </nav>

        <div className="header-actions">
          <button
            className="icon-button cart-trigger"
            type="button"
            onClick={onOpenCart || (() => navigate("/checkout"))}
            aria-label={`${onOpenCart ? "Abrir carrito" : "Ir al carrito"} con ${totalItems} productos`}
          >
            <ShoppingCart size={21} strokeWidth={1.8} />
            <span className="cart-count">{totalItems}</span>
          </button>

          {estaAutenticado ? (
            <div className="store-account">
              <div className="store-user">
                <div className="store-user-avatar">
                  <UserRound size={17} />
                </div>
                <div className="store-user-info">
                  <small>Bienvenido/a</small>
                  <strong>{usuario.nombre}</strong>
                </div>
              </div>

              {esAdmin && (
                <Link
                  className="store-account-button store-admin-button"
                  to="/admin"
                  aria-label="Panel de administración"
                  title="Panel de administración"
                >
                  <LayoutDashboard size={16} />
                  <span>Panel admin</span>
                </Link>
              )}

              <Link
                className="store-account-button"
                to="/mis-pedidos"
                aria-label="Mis pedidos"
                title="Mis pedidos"
              >
                <Package size={16} />
                <span>Mis pedidos</span>
              </Link>

              <button
                className="store-logout-button"
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link className="login-button store-login" to="/login">
              <LogIn size={16} />
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </header>

    </>
  );
}
