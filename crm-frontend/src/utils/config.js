export function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (import.meta.env.PROD && !apiUrl) {
    throw new Error("Falta configurar VITE_API_URL para produccion.");
  }

  if (import.meta.env.PROD && apiUrl.startsWith("http://")) {
    throw new Error("VITE_API_URL debe usar HTTPS en produccion.");
  }

  return apiUrl || "http://localhost:4002";
}
