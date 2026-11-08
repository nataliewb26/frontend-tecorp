import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function groupDetails(details = []) {
  return details.reduce((grouped, detail) => {
    if (!detail?.campo || !detail?.mensaje) return grouped;
    return {
      ...grouped,
      [detail.campo]: [...(grouped[detail.campo] || []), detail.mensaje],
    };
  }, {});
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: [] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGeneralError("");

    const errors = {};

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = ["Ingresa un email válido."];
    }

    if (!PASSWORD_PATTERN.test(form.password)) {
      errors.password = [
        "La contraseña debe tener al menos 8 caracteres, una letra y un número.",
      ];
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const session = await login({
        email: form.email.trim(),
        password: form.password,
      });
      navigate(session.usuario.rol === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (requestError) {
      setGeneralError(
        requestError.status === 401
          ? "Email o contraseña incorrectos"
          : requestError.message || "No se pudo iniciar sesión."
      );
      setFieldErrors(groupDetails(requestError.detalles));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-container">
      <div className="form-card">
        <span className="eyebrow">BIENVENIDO A TECORP</span>
        <h1>Iniciar sesión</h1>
        <p>Ingresa a tu cuenta para continuar.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />
          {(fieldErrors.email || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>
              {message}
            </p>
          ))}

          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            autoComplete="current-password"
            minLength="8"
            required
          />
          {(fieldErrors.password || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>
              {message}
            </p>
          ))}

          {generalError && (
            <p className="checkout-error" role="alert">{generalError}</p>
          )}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="form-bottom">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </section>
  );
}
