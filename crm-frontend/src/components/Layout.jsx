import Sidebar from "./Sidebar";

export default function Layout({ currentPage, onNavigate, searchPlaceholder, onSearch, searchValue, headerRight, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff] font-[Inter,sans-serif] text-[#0b1c30]">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 flex flex-col md:ml-[260px] h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 border-b border-gray-200 shadow-sm shrink-0">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              placeholder={searchPlaceholder ?? "Buscar..."}
              type="text"
              value={searchValue ?? ""}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-gray-200 mx-1" />
            {headerRight}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
