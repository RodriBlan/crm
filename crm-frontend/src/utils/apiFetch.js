const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4002";
const CACHE_TTL = 5 * 60 * 1000;
const getCache = new Map();

function responseFromCache(entry) {
  return new Response(entry.body, {
    status: entry.status,
    headers: entry.headers,
  });
}

export function clearApiCache() {
  getCache.clear();
}

/**
 * Wrapper de fetch que agrega automáticamente el JWT en cada request.
 * - 401/403 → redirige al login (token expirado o inválido)
 * - Otros errores (400, 500, etc.) → los devuelve para que el componente los maneje
 */
export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("crm_token");
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (method === "GET") {
    const cached = getCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return responseFromCache(cached);
    }
    if (cached) getCache.delete(cacheKey);
  } else {
    clearApiCache();
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Solo redirigir al login si el token es inválido o expiró
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_user");
    clearApiCache();
    window.location.href = "/";
    return null;
  }

  if (method === "GET" && res.ok) {
    const body = await res.clone().text();
    getCache.set(cacheKey, {
      body,
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
      createdAt: Date.now(),
    });
  }

  // Para cualquier otro error devolver la respuesta
  // para que el componente pueda leer el mensaje del backend
  return res;
}

/**
 * Helper para leer el mensaje de error del backend de forma segura.
 * El backend puede devolver texto plano o JSON con campo "message".
 */
export async function readErrorMessage(res) {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json.message ?? json.error ?? text;
    } catch {
      return text || "Error desconocido.";
    }
  } catch {
    return "Error al comunicarse con el servidor.";
  }
}
