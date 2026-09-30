const icons = {
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
  "arrow-right": <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  "arrow-left": <><path d="M19 12H5M10 7l-5 5 5 5" /></>,
  "chevron-right": <><path d="M9 6l6 6-6 6" /></>,
  "chevron-left": <><path d="M15 6l-6 6 6 6" /></>,
  "chevron-down": <><path d="M6 9l6 6 6-6" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L20 20" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  edit: <><path d="M4 20h4l11-11a2.8 2.8 0 00-4-4L4 16v4zM13.5 6.5l4 4" /></>,
  trash: <><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></>,
  eye: <><path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3M12 14v2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0114 0" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.5M17 14a5 5 0 014 5" /></>,
  "user-plus": <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M18 8v6M15 11h6" /></>,
  "user-check": <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 12l2 2 4-5" /></>,
  "user-off": <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M17 10l5 5M22 10l-5 5" /></>,
  "user-search": <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M18 13a3 3 0 100 6 3 3 0 000-6zM20 18l2 2" /></>,
  "user-shield": <><circle cx="8.5" cy="7.5" r="3" /><path d="M3 18a5.5 5.5 0 018.5-4.6M17 11l4 1.6V16c0 2.5-1.7 4.5-4 5-2.3-.5-4-2.5-4-5v-3.4L17 11z" /></>,
  phone: <><path d="M7 3l3 4-2 2c1.5 3 3.5 5 6.5 6.5l2-2 4 3c-1 3-3 4.5-5.5 4C9 19 5 15 3.5 9 3 6.5 4 4 7 3z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  history: <><path d="M4 8V4m0 0h4M4 4a9 9 0 11-1 11" /><path d="M12 7v5l3 2" /></>,
  home: <><path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6" /></>,
  "layout-dashboard": <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  package: <><path d="M4 8l8-4 8 4-8 4-8-4zM4 8v9l8 4 8-4V8M12 12v9" /></>,
  category: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h4" /></>,
  wallet: <><path d="M4 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a3 3 0 013-3h11" /><path d="M15 11h5v5h-5a2.5 2.5 0 010-5z" /></>,
  "shopping-cart": <><path d="M3 4h2l2.2 10h9.8l2-7H7M9 19a1 1 0 110 2 1 1 0 010-2M17 19a1 1 0 110 2 1 1 0 010-2" /></>,
  "credit-card": <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  coins: <><ellipse cx="9" cy="7" rx="5" ry="2.5" /><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7M4 11v4c0 1.4 2.2 2.5 5 2.5 1 0 2-.2 2.8-.5" /><path d="M14 11.5c3 0 5 1.1 5 2.5v4c0 1.4-2 2.5-5 2.5s-5-1.1-5-2.5v-.5" /></>,
  "chart-line": <><path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-7" /></>,
  "chart-bar": <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18" /></>,
  "chart-pie": <><path d="M11 3a9 9 0 109 9h-9V3z" /><path d="M14 3.5A8 8 0 0120.5 10H14V3.5z" /></>,
  notes: <><path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2zM8 8h8M8 12h8M8 16h5" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  "alert-circle": <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>,
  "alert-triangle": <><path d="M10.2 4.5L2.8 18a2 2 0 001.8 3h14.8a2 2 0 001.8-3L13.8 4.5a2 2 0 00-3.6 0zM12 9v5M12 18h.01" /></>,
  "circle-check": <><circle cx="12" cy="12" r="9" /><path d="M8 12l2.5 2.5L16.5 8" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5M18.5 10A7 7 0 006 7M5.5 14A7 7 0 0018 17" /></>,
  inbox: <><path d="M4 5h16l2 10v4H2v-4L4 5zM3 15h5l2 3h4l2-3h5" /></>,
  "route-off": <><path d="M5 5l14 14M6 18a3 3 0 110-6h2M16 6h2a3 3 0 010 6h-2M10 12h4" /></>,
  login: <><path d="M10 5H5v14h5M13 8l4 4-4 4M8 12h9" /></>,
  logout: <><path d="M14 5h5v14h-5M11 8l-4 4 4 4M16 12H7" /></>,
  "address-book": <><rect x="5" y="3" width="15" height="18" rx="2" /><path d="M5 7H3M5 12H3M5 17H3" /><circle cx="12.5" cy="9" r="2.5" /><path d="M8.5 17a4 4 0 018 0" /></>,
};

const aliases = {
  "clock-hour-4": "clock",
};

export default function Icon({ name, size = 18, className = "", ...props }) {
  const key = aliases[name?.replace(/^ti-/, "")] ?? name?.replace(/^ti-/, "");
  return (
    <svg
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icons[key] ?? icons.inbox}
    </svg>
  );
}
