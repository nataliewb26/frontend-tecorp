import { Link } from "react-router-dom";

export default function Register() {
  function handleSubmit(event) {
    event.preventDefault();
    const password = event.currentTarget.password.value;
    const confirm = event.currentTarget.confirmPassword.value;

    if (password !== confirm) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    alert("El registro se conectará con el backend.");
  }

  return (
    <section className="page-container">
      <div className="form-card">
        <span className="eyebrow">ÚNETE A TECORP</span>
        <h1>Crear cuenta</h1>
        <p>Regístrate para disfrutar de nuestra tienda.</p>
        <form onSubmit={handleSubmit}>
          <label>Nombre completo</label>
          <input name="name" placeholder="Tu nombre" required />
          <label>Correo electrónico</label>
          <input name="email" type="email" placeholder="correo@ejemplo.com" required />
          <label>Contraseña</label>
          <input name="password" type="password" minLength="6" placeholder="Mínimo 6 caracteres" required />
          <label>Confirmar contraseña</label>
          <input name="confirmPassword" type="password" minLength="6" placeholder="Repite tu contraseña" required />
          <button className="primary-button" type="submit">Crear cuenta</button>
        </form>
        <p className="form-bottom">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </section>
  );
}