import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link to="/" className="footer-brand">TECORP STORE</Link>
        <p>Tecnología para conectar con tu mundo.</p>
      </div>
      <div className="footer-links">
        <Link to="/">Inicio</Link>
        <Link to="/login">Mi cuenta</Link>
        <Link to="/admin">Administración</Link>
      </div>
      <small>© {new Date().getFullYear()} TECORP STORE. Todos los derechos reservados.</small>
    </footer>
  );
}