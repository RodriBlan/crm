import Sidebar from "./Sidebar";

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
  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="app-main">
        <header className="app-topbar">
          {showSearch ? (
            <label className="app-search">
              <span className="sr-only">{searchPlaceholder ?? "Buscar"}</span>
              <i className="ti ti-search" aria-hidden="true" />
              <input
                type="search"
                placeholder={searchPlaceholder ?? "Buscar..."}
                value={searchValue ?? ""}
                onChange={(event) => onSearch?.(event.target.value)}
              />
            </label>
          ) : (
            <div className="topbar-context" aria-label="Espacio de trabajo actual">
              <span>Espacio de trabajo</span>
              <strong>Gestión comercial</strong>
            </div>
          )}

          <div className="app-header-actions">{headerRight}</div>
        </header>

        <div className="app-content">
          <div className="content-container">{children}</div>
        </div>
      </main>
    </div>
  );
}
