import Sidebar from "./Sidebar";
import Icon from "./Icon";

const PAGE_CONTEXT = {
  dashboard: { section: "Operación", label: "Resumen" },
  clients: { section: "Operación", label: "Clientes" },
  products: { section: "Operación", label: "Productos" },
  sales: { section: "Comercial", label: "Ventas" },
  history: { section: "Comercial", label: "Historial" },
  users: { section: "Administración", label: "Usuarios" },
};

export default function Layout({
  currentPage,
  onNavigate,
  searchPlaceholder,
  onSearch,
  searchValue,
  showSearch = true,
  headerRight,
  children,
}) {
  const context = PAGE_CONTEXT[currentPage] ?? { section: "YourClients", label: "Espacio de trabajo" };

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <div className="app-shell">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

        <main className="app-main" id="main-content" tabIndex={-1}>
          <header className="app-topbar">
            <div className="topbar-route" aria-label="Ubicación actual">
              <span>{context.section}</span>
              <Icon name="chevron-right" size={12} />
              <strong>{context.label}</strong>
            </div>

            {showSearch && (
              <label className="app-search">
                <span className="sr-only">{searchPlaceholder ?? "Buscar"}</span>
                <Icon name="search" size={17} />
                <input type="search" placeholder={searchPlaceholder ?? "Buscar..."} value={searchValue ?? ""} onChange={(event) => onSearch?.(event.target.value)} />
                {searchValue && <button type="button" aria-label="Limpiar búsqueda" onClick={() => onSearch?.("")}><Icon name="x" size={15} /></button>}
              </label>
            )}

            <div className="app-header-actions">{headerRight}</div>
          </header>

          <div className="app-content"><div className="content-container">{children}</div></div>
        </main>
      </div>
    </>
  );
}
