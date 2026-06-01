import Sidebar from "./Sidebar";

export default function Layout({ currentPage, onNavigate, searchPlaceholder, onSearch, searchValue, showSearch = true, headerRight, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4FA", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main style={{ flex: 1, marginLeft: "200px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "0.5px solid rgba(27,58,107,0.1)", padding: "0 20px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          {/* Search — solo si showSearch es true */}
          {showSearch ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F0F4FA", border: "0.5px solid rgba(27,58,107,0.1)", borderRadius: "20px", padding: "7px 14px", width: "220px" }}>
              <i className="ti ti-search" style={{ fontSize: "14px", color: "#6B89B8" }} aria-hidden="true" />
              <input type="text" placeholder={searchPlaceholder ?? "Buscar..."} value={searchValue ?? ""} onChange={(e) => onSearch?.(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", fontSize: "12px", color: "#1B3A6B", width: "100%" }} />
            </div>
          ) : (
            <div /> /* spacer vacío para mantener el flex */
          )}

          {/* Right — solo el botón de acción */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {headerRight}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {children}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        tr:hover .row-actions { opacity: 1 !important; }
        input::placeholder { color: #6B89B8; }
        textarea::placeholder { color: #6B89B8; }
        select:focus, input:focus, textarea:focus { border-color: #378ADD !important; box-shadow: 0 0 0 3px rgba(55,138,221,0.1) !important; }
      `}</style>
    </div>
  );
}
