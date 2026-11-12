import { apiRequest } from "./api";

export function login({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registro({ nombre, email, password, telefono }) {
  return apiRequest("/auth/registro", {
    method: "POST",
    body: {
      nombre,
      email,
      password,
      ...(telefono ? { telefono } : {}),
    },
  });
}

export function perfil() {
  return apiRequest("/auth/perfil");
}
