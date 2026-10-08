import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";

const NAV = [
  { icon: "home", label: "Resumen", page: "dashboard" },
  { icon: "user", label: "Clientes", page: "clients" },
  { icon: "package", label: "Productos", page: "products" },
  { icon: "credit-card", label: "Ventas", page: "sales" },
  { icon: "clock", label: "Historial", page: "history" },
  { icon: "user-shield", label: "Usuarios", page: "users", adminOnly: true },
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
        <img className="sidebar-brand-logo" src="/printvar-logo.png" alt="PrintVar, Codificadoras Inkjet" />
      </div>

      <div className="sidebar-nav">
        {visibleNav.map((item) => {
          const active = currentPage === item.page;
          return (
            <button className={`sidebar-link${active ? " is-active" : ""}`} key={item.page} onClick={() => onNavigate(item.page)} aria-current={active ? "page" : undefined}>
              <Icon name={item.icon} size={18} /><span>{item.label}</span>
            </button>
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
          <Icon name={isAuthenticated ? "logout" : "login"} size={17} />
        </button>
      </div>
    </nav>
  );
}
