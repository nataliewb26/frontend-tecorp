import { apiRequest } from "./api";

export function crearPedido({ direccion_envio, items }) {
  return apiRequest("/pedidos", {
    method: "POST",
    body: { direccion_envio, items },
  });
}

export function listarMisPedidos() {
  return apiRequest("/pedidos/mis-pedidos");
}

export function listarPedidos({ estado, pagina = 1, limite = 10 } = {}) {
  const params = new URLSearchParams();

  if (estado) params.set("estado", estado);
  params.set("pagina", pagina);
  params.set("limite", limite);

  return apiRequest(`/pedidos?${params.toString()}`);
}

export function actualizarEstadoPedido(id, estado) {
  return apiRequest(`/pedidos/${encodeURIComponent(id)}/estado`, {
    method: "PUT",
    body: { estado },
  });
}
