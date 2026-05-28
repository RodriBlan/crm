import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", page: "dashboard" },
  { icon: "group", label: "Clients", page: "clients" },
  { icon: "inventory_2", label: "Products", page: "products" },
  { icon: "payments", label: "Sales", page: "sales" },
  { icon: "history", label: "History", page: "history" },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <nav className="hidden md:flex bg-[#131b2e] text-white fixed left-0 top-0 h-screen w-[260px] flex-col z-50 border-r border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#0058be] flex items-center justify-center font-bold text-sm shrink-0">
          {user?.username?.[0]?.toUpperCase() ?? "A"}
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-base leading-tight truncate">{user?.username ?? "Admin"}</h1>
          <p className="text-xs text-white/50">{user?.role ?? "ADMIN"}</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`flex items-center gap-4 py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-all duration-150 w-full text-left ${
                active
                  ? "bg-[#2170e4] text-white border-l-4 border-[#0058be]"
                  : "text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-1">
        <button
          onClick={logout}
          className="flex items-center gap-4 py-2 px-3 text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
