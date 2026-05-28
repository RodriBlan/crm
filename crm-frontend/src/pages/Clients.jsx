import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/Layout";

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

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
    if (!form.name || !form.phone) { setError("Nombre y teléfono son obligatorios."); return; }
    setLoading(true); setError(null);
    try {
      const method = client ? "PUT" : "POST";
      const path = client ? `/clients/${client.id}` : "/clients";
      const res = await apiFetch(path, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Error al guardar el cliente.");
      onSave(await res.json(), !!client);
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
          <h2 className="font-semibold text-lg text-gray-900">{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

        <div className="flex flex-col gap-3">
          {[
            { label: "Nombre *", name: "name", type: "text", placeholder: "Juan Pérez" },
            { label: "Teléfono *", name: "phone", type: "text", placeholder: "1134567890" },
            { label: "Email", name: "email", type: "email", placeholder: "juan@email.com" },
            { label: "Fuente", name: "source", type: "text", placeholder: "Instagram, Referido..." },
          ].map((f) => (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observaciones / Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Ej: cliente VIP, prefiere contacto por WhatsApp..." rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#0058be] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {client ? "Guardar Cambios" : "Crear Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDetailPanel({ client, onClose }) {
  if (!client) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto z-10">
        <div className="bg-[#131b2e] text-white p-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0058be] flex items-center justify-center text-xl font-bold">
              {getInitials(client.name)}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{client.name}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 ${client.active ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-gray-500/20 text-gray-300 border border-gray-500/30"}`}>
                {client.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5 flex-1">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Datos de contacto</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: "phone", label: "Teléfono", value: client.phone },
                { icon: "email", label: "Email", value: client.email },
                { icon: "person_add", label: "Fuente", value: client.source },
                { icon: "calendar_today", label: "Registrado", value: client.registrationDate },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[18px] text-gray-400 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Observaciones / Notas</h3>
            {client.notes ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{client.notes}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-gray-300 text-[32px]">notes</span>
                <p className="text-sm text-gray-400 mt-1">Sin observaciones</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Clients({ currentPage, onNavigate }) {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  async function fetchClients() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/clients");
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      setClients(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? clients.filter((c) => c.name?.toLowerCase().includes(q)) : clients);
    setPage(1);
  }, [search, clients]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(saved, isEdit) {
    setClients((prev) => isEdit ? prev.map((c) => c.id === saved.id ? saved : c) : [...prev, saved]);
    if (detail?.id === saved.id) setDetail(saved);
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      const res = await apiFetch(`/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar.");
      setClients((prev) => prev.filter((c) => c.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (err) { alert(err.message); }
  }

  async function handleToggleStatus(id, active) {
    try {
      const res = await apiFetch(`/clients/${id}/status?active=${active}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al cambiar estado.");
      const updated = await res.json();
      setClients((prev) => prev.map((c) => c.id === id ? updated : c));
      if (detail?.id === id) setDetail(updated);
    } catch (err) { alert(err.message); }
  }

  const activeCount = clients.filter((c) => c.active).length;

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      searchPlaceholder="Buscar cliente por nombre..."
      searchValue={search}
      onSearch={setSearch}
      headerRight={
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Crear Nuevo
        </button>
      }
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Clientes</span>
            <span className="text-4xl font-bold text-gray-900 mt-2">{loading ? "—" : clients.length}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clientes Activos</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-gray-900">{loading ? "—" : activeCount}</span>
              {!loading && clients.length > 0 && (
                <span className="text-sm text-green-600 font-medium">{Math.round((activeCount / clients.length) * 100)}%</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex items-end justify-end pb-1">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filtrar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
            <button onClick={fetchClients} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Nombre", "Teléfono", "Email", "Fuente", "Notas", "Estado", "Acciones"].map((h) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200" /><div className="h-4 bg-gray-200 rounded w-32" /></div></td>
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>)}
                      <td className="py-3 px-4" />
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">{search ? "No se encontraron clientes." : "No hay clientes aún."}</td></tr>
                ) : (
                  paginated.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setDetail(client)}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">{getInitials(client.name)}</div>
                          <span className="font-semibold text-sm text-gray-900">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-500">{client.phone ?? "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{client.email ?? "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{client.source ?? "—"}</td>
                      <td className="py-3 px-4 max-w-[180px]">
                        {client.notes
                          ? <span className="text-sm text-gray-500 truncate block" title={client.notes}>{client.notes}</span>
                          : <span className="text-sm text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        {client.active
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-700 text-xs font-semibold uppercase tracking-wide">Activo</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded border border-gray-300 bg-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">Inactivo</span>}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleStatus(client.id, !client.active)}
                            className={`transition-colors ${client.active ? "text-gray-400 hover:text-yellow-600" : "text-gray-400 hover:text-green-600"}`}
                            title={client.active ? "Desactivar" : "Activar"}>
                            <span className="material-symbols-outlined text-[18px]">{client.active ? "person_off" : "person"}</span>
                          </button>
                          <button onClick={() => setModal(client)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
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

          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {loading ? "Cargando..." : `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} clientes`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${p === page ? "bg-[#0058be] text-white" : "text-gray-500 hover:bg-gray-200"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {detail && <ClientDetailPanel client={detail} onClose={() => setDetail(null)} />}
      {modal && <ClientModal client={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
