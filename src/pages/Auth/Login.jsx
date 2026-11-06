import { Link } from "react-router-dom";

export default function Login() {
  function handleSubmit(event) {
    event.preventDefault();
    alert("El inicio de sesión se conectará con el backend.");
  }

  return (
    <section className="page-container">
      <div className="form-card">
        <span className="eyebrow">BIENVENIDO A TECORP</span>
        <h1>Iniciar sesión</h1>
        <p>Ingresa a tu cuenta para continuar.</p>
        <form onSubmit={handleSubmit}>
          <label>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" required />
          <label>Contraseña</label>
          <input type="password" placeholder="Tu contraseña" minLength="6" required />
          <button className="primary-button" type="submit">Ingresar</button>
        </form>
        <p className="form-bottom">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
      </div>
    </section>
  );
}