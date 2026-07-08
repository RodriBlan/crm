import { useAuth } from "../hooks/useAuth";

const NAV = [
  { icon: "ti-layout-dashboard", label: "Dashboard", page: "dashboard" },
  { icon: "ti-users", label: "Clientes", page: "clients" },
  { icon: "ti-box", label: "Productos", page: "products" },
  { icon: "ti-credit-card", label: "Ventas", page: "sales", section: "Transacciones" },
  { icon: "ti-clock-hour-4", label: "Historial", page: "history" },
  { icon: "ti-user-shield", label: "Usuarios", page: "users", section: "Administracion", adminOnly: true },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();

  function goToLogin() {
    window.history.pushState(null, "", "/login");
    window.dispatchEvent(new Event("popstate"));
  }

  return (
    <nav className="app-sidebar" style={{ width: "200px", background: "#1B3A6B", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 50 }}>
      <div className="sidebar-brand" style={{ padding: "18px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500", color: "#fff", flexShrink: 0 }}>YC</div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff", lineHeight: 1.2 }}>YourClients</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{isAuthenticated ? "CRM" : "Vista previa"}</div>
        </div>
      </div>

      <div className="sidebar-nav" style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {NAV.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item, idx, items) => {
          const active = currentPage === item.page;
          const showSection = item.section && items[idx - 1]?.section !== item.section;
          return (
            <div key={item.page}>
              {showSection && (
                <div className="sidebar-section" style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", padding: "10px 8px 4px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "500" }}>
                  {item.section}
                </div>
              )}
              <button
                className="sidebar-link"
                onClick={() => onNavigate(item.page)}
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  padding: "8px 10px", width: "100%", border: "none",
                  borderRadius: "8px", background: active ? "rgba(255,255,255,0.15)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  fontSize: "12px", fontWeight: active ? "500" : "400",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: "16px" }} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer" style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "500", color: "#fff", flexShrink: 0 }}>
          {isAuthenticated ? (user?.username?.[0]?.toUpperCase() ?? "A") : "D"}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isAuthenticated ? (user?.username ?? "Admin") : "Demo"}</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{isAuthenticated ? (user?.role ?? "ADMIN") : "Solo lectura"}</div>
        </div>
        <button
          onClick={isAuthenticated ? logout : goToLogin}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "4px", display: "flex" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
          title={isAuthenticated ? "Cerrar sesion" : "Iniciar sesion"}
        >
          <i className={`ti ${isAuthenticated ? "ti-logout" : "ti-login"}`} style={{ fontSize: "15px" }} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
