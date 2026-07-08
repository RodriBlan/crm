import { createContext, useContext, useState } from "react";
import { clearApiCache } from "../utils/apiFetch";
import { getApiUrl } from "../utils/config";

const AuthContext = createContext(null);
const API_URL = getApiUrl();
const LOGIN_TIMEOUT_MS = 45000;

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => window.clearTimeout(timeoutId) };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("crm_token"));
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("crm_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  async function login(username, password) {
    const timeout = createTimeoutSignal(LOGIN_TIMEOUT_MS);
    let res;

    try {
      res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: timeout.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("El servidor esta tardando en responder. Espera unos segundos y volve a intentar.");
      }
      throw new Error("No se pudo conectar con el servidor. Revisa tu conexion e intenta de nuevo.");
    } finally {
      timeout.clear();
    }

    if (!res.ok) {
      let message = "Usuario o contrasena incorrectos";
      try {
        const data = await res.json();
        message = data.message ?? message;
      } catch {
        // Mantener mensaje generico si el servidor no devuelve JSON.
      }
      throw new Error(message);
    }

    const data = await res.json();
    const nextUser = { username: data.username, role: data.role };

    sessionStorage.setItem("crm_token", data.token);
    sessionStorage.setItem("crm_user", JSON.stringify(nextUser));
    clearApiCache();
    setToken(data.token);
    setUser(nextUser);
    return data;
  }

  async function requestAccess(username, password) {
    const timeout = createTimeoutSignal(LOGIN_TIMEOUT_MS);
    let res;

    try {
      res = await fetch(`${API_URL}/auth/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: timeout.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("El servidor esta tardando en responder. Espera unos segundos y volve a intentar.");
      }
      throw new Error("No se pudo conectar con el servidor. Revisa tu conexion e intenta de nuevo.");
    } finally {
      timeout.clear();
    }

    if (!res.ok) {
      let message = "No se pudo enviar la solicitud.";
      try {
        const data = await res.json();
        message = data.message ?? message;
      } catch {
        // Mantener mensaje generico si el servidor no devuelve JSON.
      }
      throw new Error(message);
    }

    return res.json();
  }

  function logout() {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_user");
    clearApiCache();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, requestAccess, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
