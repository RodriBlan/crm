import { useState, useEffect } from "react";

const API_URL = "http://localhost:4002";

// ─── Helper: iniciales del nombre ───────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Modal: Crear / Editar cliente ──────────────────────────────────────────
function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    source: client?.source ?? "",
    notes: client?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const method = client ? "PUT" : "POST";
      const url = client ? `${API_URL}/clients/${client.id}` : `${API_URL}/clients`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar el cliente.");
      const saved = await res.json();
      onSave(saved, !!client);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">
            {client ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {[
            { label: "Nombre *", name: "name", type: "text", placeholder: "Juan Pérez" },
            { label: "Teléfono *", name: "phone", type: "text", placeholder: "1134567890" },
            { label: "Email", name: "email", type: "email", placeholder: "juan@email.com" },
            { label: "Fuente", name: "source", type: "text", placeholder: "Instagram, Referido..." },
          ].map((f) => (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notas
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Observaciones..."
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {client ? "Guardar Cambios" : "Crear Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Clients() {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | "create" | client object
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // ── Fetch clientes ────────────────────────────────────────────────────────
  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/clients`);
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      setClients(data);
      setFiltered(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  // ── Búsqueda local ────────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? clients.filter((c) => c.name?.toLowerCase().includes(q)) : clients
    );
    setPage(1);
  }, [search, clients]);

  // ── Paginación ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  function handleSave(saved, isEdit) {
    setClients((prev) =>
      isEdit ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]
    );
    setModal(null);
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      const res = await fetch(`${API_URL}/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar.");
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const activeCount = clients.filter((c) => c.active).length;

  return (
    <>
      {/* Fonts & Icons */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className="flex h-screen overflow-hidden bg-[#f8f9ff] font-[Inter,sans-serif] text-[#0b1c30]">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <nav className="hidden md:flex bg-[#131b2e] text-white fixed left-0 top-0 h-screen w-[260px] flex-col z-50 border-r border-white/5">
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Admin Panel</h1>
              <p className="text-xs text-white/50">Enterprise Edition</p>
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1">
            {[
              { icon: "dashboard", label: "Dashboard", active: false },
              { icon: "group", label: "Clients", active: true },
              { icon: "inventory_2", label: "Products", active: false },
              { icon: "payments", label: "Sales", active: false },
              { icon: "history", label: "History", active: false },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-4 py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-all duration-150 ${
                  item.active
                    ? "bg-[#2170e4] text-white border-l-4 border-[#0058be]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${item.active ? "icon-fill" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex flex-col gap-1">
            {[
              { icon: "help", label: "Help Center" },
              { icon: "logout", label: "Logout" },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-4 py-2 px-3 text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col md:ml-[260px] h-screen overflow-hidden">
          {/* Top bar */}
          <header className="bg-white flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 border-b border-gray-200 shadow-sm shrink-0">
            <div className="flex-1 max-w-md relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="Buscar cliente por nombre..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button
                onClick={() => setModal("create")}
                className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Crear Nuevo
              </button>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1440px] mx-auto space-y-6">

              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total Clientes
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {loading ? "—" : clients.length}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Clientes Activos
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {loading ? "—" : activeCount}
                    </span>
                    {!loading && clients.length > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        {Math.round((activeCount / clients.length) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end justify-end pb-1">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">filter_list</span>
                      Filtrar
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                  <button onClick={fetchClients} className="ml-auto underline text-red-600 hover:text-red-800">
                    Reintentar
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        {["Nombre", "Teléfono", "Email", "Fuente", "Estado", "Acciones"].map((h) => (
                          <th
                            key={h}
                            className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                              h === "Acciones" ? "text-right" : ""
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        // Skeleton rows
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                              </div>
                            </td>
                            {Array.from({ length: 4 }).map((_, j) => (
                              <td key={j} className="py-3 px-4">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                              </td>
                            ))}
                            <td className="py-3 px-4" />
                          </tr>
                        ))
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                            {search ? "No se encontraron clientes con ese nombre." : "No hay clientes aún."}
                          </td>
                        </tr>
                      ) : (
                        paginated.map((client) => (
                          <tr
                            key={client.id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            {/* Nombre */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
                                  {getInitials(client.name)}
                                </div>
                                <span className="font-semibold text-sm text-gray-900">
                                  {client.name}
                                </span>
                              </div>
                            </td>
                            {/* Teléfono */}
                            <td className="py-3 px-4 font-mono text-sm text-gray-500">
                              {client.phone ?? "—"}
                            </td>
                            {/* Email */}
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {client.email ?? "—"}
                            </td>
                            {/* Fuente */}
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {client.source ?? "—"}
                            </td>
                            {/* Estado */}
                            <td className="py-3 px-4">
                              {client.active ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide">
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-300 bg-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                                  Inactivo
                                </span>
                              )}
                            </td>
                            {/* Acciones */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setModal(client)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Editar"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(client.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Eliminar"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {loading
                      ? "Cargando..."
                      : `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} clientes`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-[#0058be] text-white"
                            : "text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <ClientModal
          client={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

    