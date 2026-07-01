// ── Paleta azul marino ──────────────────────────────────────────────────────
export const BLUE = {
  900: "#0F2347",
  800: "#1B3A6B",  // color principal
  700: "#2A5298",
  600: "#378ADD",
  400: "#6B89B8",
  200: "#B5CDE8",
  100: "#DCE8F8",
  50:  "#F0F4FA",  // fondo contenido
};

// ── Colores semánticos ───────────────────────────────────────────────────────
export const STATUS = {
  COMPLETED: { bg: "#E1F5EE", color: "#0F6E56", dot: "#1D9E75", label: "Completada" },
  PENDING:   { bg: "#DCE8F8", color: "#1B3A6B", dot: "#378ADD", label: "Pendiente" },
  CANCELLED: { bg: "#FCEBEB", color: "#A32D2D", dot: "#E24B4A", label: "Cancelada" },
};

// ── Estilos compartidos ──────────────────────────────────────────────────────
export const S = {
  card: {
    background: "#fff",
    border: "0.5px solid rgba(27,58,107,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  th: {
    padding: "9px 14px",
    fontSize: "10px",
    fontWeight: "500",
    color: "#6B89B8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#F0F4FA",
    borderBottom: "0.5px solid rgba(27,58,107,0.08)",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 14px",
    fontSize: "13px",
    color: "#1B3A6B",
    borderBottom: "0.5px solid rgba(27,58,107,0.06)",
  },
  input: {
    border: "0.5px solid rgba(27,58,107,0.15)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#1B3A6B",
    background: "#fff",
    outline: "none",
    width: "100%",
  },
  btnPrimary: {
    background: "#1B3A6B",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "#fff",
    color: "#1B3A6B",
    border: "0.5px solid rgba(27,58,107,0.2)",
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  btnWarning: {
    background: "#FAEEDA",
    color: "#854F0B",
    border: "0.5px solid #EF9F27",
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
export function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function fmtMoney(n) {
  if (n == null) return "—";
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
  return "$" + Number(n).toFixed(2);
}

export function fmtNum(n) {
  return n == null ? "—" : Number(n).toLocaleString("es-AR");
}

// ── Componentes compartidos ──────────────────────────────────────────────────
export function Avatar({ name, size = 28, fontSize = 10 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#DCE8F8", color: "#1B3A6B", display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: "500", flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.PENDING;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: s.bg, color: s.color }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ width: "28px", height: "28px", borderRadius: "8px", border: "0.5px solid rgba(27,58,107,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1, color: "#1B3A6B" }}>
        <i className="ti ti-chevron-left" style={{ fontSize: "14px" }} aria-hidden="true" />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPage(p)}
          style={{ width: "28px", height: "28px", borderRadius: "8px", border: p === page ? "none" : "0.5px solid rgba(27,58,107,0.15)", background: p === page ? "#1B3A6B" : "none", color: p === page ? "#fff" : "#1B3A6B", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        style={{ width: "28px", height: "28px", borderRadius: "8px", border: "0.5px solid rgba(27,58,107,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1, color: "#1B3A6B" }}>
        <i className="ti ti-chevron-right" style={{ fontSize: "14px" }} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#A32D2D" }}>
      <i className="ti ti-alert-circle" style={{ fontSize: "16px", flexShrink: 0 }} aria-hidden="true" />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: "#A32D2D", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>Reintentar</button>}
    </div>
  );
}

export function SkeletonRows({ cols = 5, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} style={{ padding: "10px 14px" }}>
          <div style={{ height: "13px", background: "#EEF2F8", borderRadius: "4px", width: j === 0 ? "140px" : "80px" }} />
        </td>
      ))}
    </tr>
  ));
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="app-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(27,58,107,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="app-modal" style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "460px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(27,58,107,0.15)" }}>
        <div className="app-modal-header" style={{ padding: "18px 22px", borderBottom: "0.5px solid rgba(27,58,107,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#1B3A6B" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B89B8", display: "flex", alignItems: "center", padding: "2px" }}>
            <i className="ti ti-x" style={{ fontSize: "18px" }} aria-hidden="true" />
          </button>
        </div>
        <div className="app-modal-body" style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <div className="app-modal-footer" style={{ padding: "14px 22px", borderTop: "0.5px solid rgba(27,58,107,0.1)", display: "flex", justifyContent: "flex-end", gap: "8px", flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}
