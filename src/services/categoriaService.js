import { apiRequest } from "./api";

export function listar() {
  return apiRequest("/categorias");
}

export function obtener(id) {
  return apiRequest(`/categorias/${encodeURIComponent(id)}`);
}

export function crear(data) {
  return apiRequest("/categorias", {
    method: "POST",
    body: data,
  });
}

export function actualizar(id, data) {
  return apiRequest(`/categorias/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: data,
  });
}

export function eliminar(id) {
  return apiRequest(`/categorias/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
