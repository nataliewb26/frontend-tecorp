const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const SESSION_STORAGE_KEY = "tecorp_session";

function getStoredSession() {
  try {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event("tecorp:session-cleared"));
}

// [SIN USO] Export público redundante; la clase solo se usa dentro de este módulo.
// export class ApiError extends Error {
class ApiError extends Error {
  constructor(message, { status, detalles = [] } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalles = detalles;
  }
}

export async function apiRequest(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error("La URL del backend todavía no está configurada.");
  }

  const session = getStoredSession();
  const token = session?.token;
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const body =
    options.body && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body;

  const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, "")}`, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearStoredSession();
    }

    throw new ApiError(data?.error || `Error del servidor: ${response.status}`, {
      status: response.status,
      detalles: Array.isArray(data?.detalles) ? data.detalles : [],
    });
  }

  return data;
}
