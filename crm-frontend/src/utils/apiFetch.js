const API_URL = "http://localhost:4002";

/**
 * Wrapper de fetch que agrega automáticamente el JWT en cada request.
 * Uso: apiFetch("/clients")  →  GET http://localhost:4002/clients con Authorization header
 */
export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("crm_token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Si el token expiró o es inválido, redirigir al login
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_user");
    window.location.href = "/login";
    return;
  }

  return res;
}