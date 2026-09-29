export const BLUE = {
  900: "#0F1B2D",
  800: "#172033",
  700: "#2B456B",
  600: "#2563EB",
  400: "#64748B",
  200: "#D5DCE6",
  100: "#E8EFFF",
  50: "#F4F6F9",
};

export const STATUS = {
  COMPLETED: { bg: "#E3F3EC", color: "#17624F", dot: "#218A6E", label: "Completada" },
  PENDING: { bg: "#EEF0E8", color: "#626B43", dot: "#8A9658", label: "Pendiente" },
  CANCELLED: { bg: "#FBEAEA", color: "#9B3838", dot: "#C94A4A", label: "Cancelada" },
};

export const S = {
  card: {
    background: "#FFFFFF",
    border: "1px solid #E1E6EE",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(15, 27, 45, 0.035)",
  },
  th: {
    padding: "11px 16px",
    fontSize: "10px",
    fontWeight: "700",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    background: "#F8FAFC",
    borderBottom: "1px solid #E1E6EE",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #EDF0F4",
  },
  input: {
    border: "1px solid #D9E0E9",
    borderRadius: "7px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#172033",
    background: "#FFFFFF",
    outline: "none",
    width: "100%",
  },
  btnPrimary: {
    background: "#2563EB",
    color: "#FFFFFF",
    border: "1px solid #2563EB",
    borderRadius: "7px",
    minHeight: "38px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    cursor: "pointer",
  },
  btnSecondary: {
    background: "#FFFFFF",
    color: "#334155",
    border: "1px solid #D9E0E9",
    borderRadius: "7px",
    minHeight: "38px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    cursor: "pointer",
  },
  btnWarning: {
    background: "#FFF7E7",
    color: "#7A5316",
    border: "1px solid #EACB91",
    borderRadius: "7px",
    minHeight: "38px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    cursor: "pointer",
  },
};

export function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export function fmtMoney(number) {
  if (number == null) return "-";
  return "$" + Number(number).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtNum(number) {
  return number == null ? "-" : Number(number).toLocaleString("es-AR");
}

export function Avatar({ name, size = 28, fontSize = 10 }) {
  return (
    <div className="ui-avatar" style={{ width: size, height: size, fontSize }}>
      {getInitials(name)}
    </div>
  );
}

export function StatusBadge({ status }) {
  const statusStyle = STATUS[status] ?? STATUS.PENDING;
  return (
    <span
      className="status-badge"
      style={{ background: statusStyle.bg, color: statusStyle.color }}
      data-status={status}
    >
      <span style={{ background: statusStyle.dot }} aria-hidden="true" />
      {statusStyle.label}
    </span>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination" aria-label="Paginación">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <i className="ti ti-chevron-left" aria-hidden="true" />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          className={pageNumber === page ? "is-current" : ""}
          onClick={() => onPage(pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
        >
          {pageNumber}
        </button>
      ))}
      <button
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        <i className="ti ti-chevron-right" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <i className="ti ti-alert-circle" aria-hidden="true" />
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

export function SkeletonRows({ cols = 5, rows = 5 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={rowIndex} className="skeleton-row">
      {Array.from({ length: cols }).map((__, columnIndex) => (
        <td key={columnIndex}>
          <div className={columnIndex === 0 ? "skeleton-line is-wide" : "skeleton-line"} />
        </td>
      ))}
    </tr>
  ));
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="app-modal-backdrop" role="presentation">
      <section className="app-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="app-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer && <footer className="app-modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
