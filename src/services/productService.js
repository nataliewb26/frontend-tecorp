import { apiRequest } from "./api";

// [SIN USO] Export público redundante; el adaptador solo se usa dentro de este módulo.
// export function mapProducto(producto) {
function mapProducto(producto) {
  if (!producto) return null;

  return {
    ...producto,
    name: producto.nombre,
    category: producto.categorias?.nombre || "Sin categoría",
    price: Number(producto.precio),
    image: producto.imagen_url,
    imagen: producto.imagen_url,
    brand: producto.marca,
    description: producto.descripcion,
  };
}

function mapRespuestaProducto(respuesta) {
  return respuesta?.id ? mapProducto(respuesta) : respuesta;
}

export async function getProductos({ categoria, q, pagina, limite } = {}) {
  const params = new URLSearchParams();

  if (categoria) params.set("categoria", categoria);
  if (q) params.set("q", q);
  if (pagina !== undefined) params.set("pagina", pagina);
  if (limite !== undefined) params.set("limite", limite);

  const query = params.toString();
  const respuesta = await apiRequest(`/productos${query ? `?${query}` : ""}`);

  return {
    ...respuesta,
    datos: Array.isArray(respuesta?.datos)
      ? respuesta.datos.map(mapProducto)
      : [],
  };
}

export async function getProducto(id) {
  const producto = await apiRequest(`/productos/${encodeURIComponent(id)}`);
  return mapProducto(producto);
}

export async function crearProducto(data) {
  const respuesta = await apiRequest("/productos", {
    method: "POST",
    body: data,
  });

  return mapRespuestaProducto(respuesta);
}

export async function actualizarProducto(id, data) {
  const respuesta = await apiRequest(`/productos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: data,
  });

  return mapRespuestaProducto(respuesta);
}

export async function eliminarProducto(id) {
  return apiRequest(`/productos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
