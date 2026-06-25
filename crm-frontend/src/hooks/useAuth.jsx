import { createContext, useContext, useState } from "react";
import { clearApiCache } from "../utils/apiFetch";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4002";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("crm_token"));
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem("crm_user");
    return u ? JSON.parse(u) : null;
  });

  async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("Usuario o contraseña incorrectos");
    }

    const data = await res.json();
    sessionStorage.setItem("crm_token", data.token);
    sessionStorage.setItem("crm_user", JSON.stringify({ username: data.username, role: data.role }));
    clearApiCache();
    setToken(data.token);
    setUser({ username: data.username, role: data.role });
    return data;
  }

  function logout() {
    sessionStorage.removeItem("crm_token");
    sessionStorage.removeItem("crm_user");
    clearApiCache();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

