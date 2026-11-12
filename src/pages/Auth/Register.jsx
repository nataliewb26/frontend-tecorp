import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

function groupDetails(details = []) {
  return details.reduce((grouped, detail) => {
    if (!detail?.campo || !detail?.mensaje) return grouped;
    return {
      ...grouped,
      [detail.campo]: [...(grouped[detail.campo] || []), detail.mensaje],
    };
  }, {});
}

export default function Register() {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
  });
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
    const nombre = form.nombre.trim();
    const email = form.email.trim();
    const telefono = form.telefono.trim();

    if (nombre.length < 2 || nombre.length > 100) {
      errors.nombre = ["El nombre debe tener entre 2 y 100 caracteres."];
    }

    if (!EMAIL_PATTERN.test(email)) {
      errors.email = ["Ingresa un email válido."];
    }

    if (!PASSWORD_PATTERN.test(form.password)) {
      errors.password = [
        "La contraseña debe tener al menos 8 caracteres, una letra y un número.",
      ];
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = ["Las contraseñas no coinciden."];
    }

    if (telefono && !PHONE_PATTERN.test(telefono)) {
      errors.telefono = [
        "El teléfono debe tener entre 7 y 15 dígitos y puede empezar con +.",
      ];
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const session = await registro({
        nombre,
        email,
        password: form.password,
        telefono,
      });
      navigate(session.usuario.rol === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (requestError) {
      setGeneralError(requestError.message || "No se pudo crear la cuenta.");
      setFieldErrors(groupDetails(requestError.detalles));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-container">
      <div className="form-card">
        <span className="eyebrow">ÚNETE A TECORP</span>
        <h1>Crear cuenta</h1>
        <p>Regístrate para disfrutar de nuestra tienda.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre"
            minLength="2"
            maxLength="100"
            autoComplete="name"
            required
          />
          {(fieldErrors.nombre || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>{message}</p>
          ))}

          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
          />
          {(fieldErrors.email || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>{message}</p>
          ))}

          <label htmlFor="register-phone">Teléfono (opcional)</label>
          <input
            id="register-phone"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="+51999999999"
            autoComplete="tel"
          />
          {(fieldErrors.telefono || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>{message}</p>
          ))}

          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength="8"
            placeholder="Mínimo 8 caracteres, una letra y un número"
            autoComplete="new-password"
            required
          />
          {(fieldErrors.password || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>{message}</p>
          ))}

          <label htmlFor="register-confirm-password">Confirmar contraseña</label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength="8"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            required
          />
          {(fieldErrors.confirmPassword || []).map((message) => (
            <p className="product-form-error" role="alert" key={message}>{message}</p>
          ))}

          {generalError && (
            <p className="checkout-error" role="alert">{generalError}</p>
          )}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="form-bottom">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
}
