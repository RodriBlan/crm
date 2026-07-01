import { getApiUrl } from "./config";

const API_URL = getApiUrl();
const CACHE_TTL = 5 * 60 * 1000;
const getCache = new Map();

const demoClients = [
  { id: 1, name: "Sofia Martinez", phone: "1134567890", email: "sofia@email.com", source: "Instagram", notes: "Interesada en compra mayorista.", registrationDate: "2026-06-12", active: true },
  { id: 2, name: "Diego Alvarez", phone: "1167894321", email: "diego@email.com", source: "Referido", notes: "Prefiere contacto por WhatsApp.", registrationDate: "2026-06-18", active: true },
  { id: 3, name: "Camila Torres", phone: "1155577788", email: "camila@email.com", source: "Local", notes: "", registrationDate: "2026-06-22", active: false },
];

const demoCategories = [
  { id: 1, description: "Indumentaria" },
  { id: 2, description: "Accesorios" },
  { id: 3, description: "Promociones" },
];

const demoProducts = [
  { id: 1, name: "Remera premium", description: "Algodon peinado", price: 12500, stock: 18, descuento: 0, active: true, categoryId: 1, categoryDescription: "Indumentaria" },
  { id: 2, name: "Gorra bordada", description: "Ajustable", price: 8900, stock: 7, descuento: 10, active: true, categoryId: 2, categoryDescription: "Accesorios" },
  { id: 3, name: "Combo inicial", description: "Pack de productos destacados", price: 29900, stock: 4, descuento: 5, active: true, categoryId: 3, categoryDescription: "Promociones" },
];

const demoSales = [
  {
    id: 101,
    date: "2026-06-28T14:30:00",
    total: 21400,
    status: "COMPLETED",
    notes: "Entrega coordinada.",
    clientId: 1,
    clientName: "Sofia Martinez",
    items: [
      { id: 1, productId: 1, productName: "Remera premium", quantity: 1, unitPrice: 12500, subtotal: 12500 },
      { id: 2, productId: 2, productName: "Gorra bordada", quantity: 1, unitPrice: 8900, subtotal: 8900 },
    ],
  },
  {
    id: 102,
    date: "2026-06-29T10:15:00",
    total: 29900,
    status: "PENDING",
    notes: "Pendiente de confirmacion.",
    clientId: 2,
    clientName: "Diego Alvarez",
    items: [
      { id: 3, productId: 3, productName: "Combo inicial", quantity: 1, unitPrice: 29900, subtotal: 29900 },
    ],
  },
];

function responseFromCache(entry) {
  return new Response(entry.body, {
    status: entry.status,
    headers: entry.headers,
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireLogin() {
  window.dispatchEvent(new CustomEvent("auth-required"));
}

function demoResponse(path) {
  if (path === "/clients") return jsonResponse(demoClients);
  if (path === "/categories") return jsonResponse(demoCategories);
  if (path === "/products") return jsonResponse({ content: demoProducts });
  if (path === "/sales") return jsonResponse(demoSales);
  if (path.startsWith("/sales/client/")) {
    const clientId = Number(path.split("/").pop());
    return jsonResponse(demoSales.filter((sale) => sale.clientId === clientId));
  }
  if (path === "/stats") {
    return jsonResponse({
      totalSales: demoSales.length,
      totalRevenue: 21400,
      salesThisMonth: demoSales.length,
      revenueThisMonth: 21400,
      topProducts: [
        { productId: 1, productName: "Remera premium", totalQuantitySold: 1, totalRevenue: 12500 },
        { productId: 2, productName: "Gorra bordada", totalQuantitySold: 1, totalRevenue: 8900 },
      ],
      topClients: [
        { clientId: 1, clientName: "Sofia Martinez", totalPurchases: 1, totalSpent: 21400 },
        { clientId: 2, clientName: "Diego Alvarez", totalPurchases: 1, totalSpent: 29900 },
      ],
    });
  }
  return jsonResponse({ message: "Vista previa disponible solo para secciones principales." }, 404);
}

export function clearApiCache() {
  getCache.clear();
}

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("crm_token");
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (!token) {
    if (method === "GET") return demoResponse(path);
    requireLogin();
    return jsonResponse({ message: "Inicia sesion para realizar esta accion." }, 401);
  }

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

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_user");
    clearApiCache();
    requireLogin();
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

  return res;
}

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
