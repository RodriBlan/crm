import { useAuth } from "../hooks/useAuth";

const NAV = [
  { icon: "ti-layout-dashboard", label: "Resumen", page: "dashboard", section: "Operación" },
  { icon: "ti-users", label: "Clientes", page: "clients", section: "Operación" },
  { icon: "ti-package", label: "Productos", page: "products", section: "Operación" },
  { icon: "ti-receipt", label: "Ventas", page: "sales", section: "Comercial" },
  { icon: "ti-history", label: "Historial", page: "history", section: "Comercial" },
  { icon: "ti-user-shield", label: "Usuarios", page: "users", section: "Administración", adminOnly: true },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();
  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === "ADMIN");

  function goToLogin() {
    window.history.pushState(null, "", "/login");
    window.dispatchEvent(new Event("popstate"));
  }

  return (
    <nav className="app-sidebar" aria-label="Navegación principal">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden="true">
          <i className="ti ti-address-book" />
        </div>
        <div className="sidebar-brand-copy">
          <strong>YourClients</strong>
          <span>{isAuthenticated ? "Gestión comercial" : "Vista de demostración"}</span>
        </div>
      </div>

      <div className="sidebar-nav">
        {visibleNav.map((item, index) => {
          const active = currentPage === item.page;
          const showSection = item.section !== visibleNav[index - 1]?.section;

          return (
            <div className="sidebar-nav-group" key={item.page}>
              {showSection && <div className="sidebar-section">{item.section}</div>}
              <button
                className={`sidebar-link${active ? " is-active" : ""}`}
                onClick={() => onNavigate(item.page)}
                aria-current={active ? "page" : undefined}
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user-avatar" aria-hidden="true">
          {isAuthenticated ? (user?.username?.[0]?.toUpperCase() ?? "A") : "D"}
        </div>
        <div className="sidebar-user-copy">
          <strong>{isAuthenticated ? (user?.username ?? "Administrador") : "Demostración"}</strong>
          <span>{isAuthenticated ? (user?.role === "ADMIN" ? "Administrador" : "Usuario") : "Solo lectura"}</span>
        </div>
        <button
          className="sidebar-session-button"
          onClick={isAuthenticated ? logout : goToLogin}
          title={isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
          aria-label={isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
        >
          <i className={`ti ${isAuthenticated ? "ti-logout" : "ti-login"}`} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
