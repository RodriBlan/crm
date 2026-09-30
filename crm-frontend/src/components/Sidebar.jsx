import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";

const NAV = [
  { icon: "home", label: "Resumen", page: "dashboard", section: "Operación" },
  { icon: "user", label: "Clientes", page: "clients", section: "Operación" },
  { icon: "package", label: "Productos", page: "products", section: "Operación" },
  { icon: "credit-card", label: "Ventas", page: "sales", section: "Comercial" },
  { icon: "clock", label: "Historial", page: "history", section: "Comercial" },
  { icon: "user-shield", label: "Usuarios", page: "users", section: "Administración", adminOnly: true },
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
          <Icon name="address-book" size={20} />
        </div>
        <div className="sidebar-brand-copy">
          <strong>YourClients</strong>
          <span>{isAuthenticated ? "Workspace comercial" : "Vista de demostración"}</span>
        </div>
      </div>

      <div className="sidebar-nav">
        {[...new Set(visibleNav.map((item) => item.section))].map((section) => (
          <section className="sidebar-nav-section" key={section} aria-label={section}>
            <div className="sidebar-section">{section}</div>
            {visibleNav.filter((item) => item.section === section).map((item) => {
              const active = currentPage === item.page;
              return (
                <button className={`sidebar-link${active ? " is-active" : ""}`} key={item.page} onClick={() => onNavigate(item.page)} aria-current={active ? "page" : undefined}>
                  <Icon name={item.icon} size={18} /><span>{item.label}</span>
                </button>
              );
            })}
          </section>
        ))}
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
          <Icon name={isAuthenticated ? "logout" : "login"} size={17} />
        </button>
      </div>
    </nav>
  );
}
