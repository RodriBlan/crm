import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import Layout from "../components/Layout";

const STATUS_STYLES = {
  COMPLETED: "bg-green-50 border-green-300 text-green-700",
  PENDING: "bg-blue-50 border-blue-300 text-blue-700",
  CANCELLED: "bg-red-50 border-red-300 text-red-700",
};
const STATUS_LABELS = { COMPLETED: "Completada", PENDING: "Pendiente", CANCELLED: "Cancelada" };

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function SaleDetailPanel({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto z-10">
        <div className="bg-[#131b2e] text-white p-6 flex items-start justify-between shrink-0">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Venta #{sale.id}</p>
            <p className="text-white/60 text-sm mt-1">{new Date(sale.date).toLocaleDateString("es-AR")}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold uppercase ${STATUS_STYLES[sale.status] ?? ""}`}>
              {STATUS_LABELS[sale.status] ?? sale.status}
            </span>
            <span className="text-2xl font-bold font-mono text-gray-900">${Number(sale.total).toFixed(2)}</span>
          </div>
          {sale.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Notas</p>
              <p className="text-sm text-gray-700">{sale.notes}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Items</h3>
            <div className="flex flex-col gap-2">
              {sale.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.quantity} x ${Number(item.unitPrice).toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-gray-800">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function History({ currentPage, onNavigate }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sales, setSales] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    apiFetch("/clients").then((r) => r?.json()).then((d) => {
      if (Array.isArray(d)) setClients(d);
    }).catch(() => {}).finally(() => setLoadingClients(false));
  }, []);

  async function loadHistory(client) {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowDropdown(false);
    setSales([]); setError(null);
    setLoading(true); setPage(1);
    try {
      const res = await apiFetch(`/sales/client/${client.id}`);
      if (!res.ok) throw new Error("No se pudo cargar el historial.");
      setSales(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const filteredClients = clientSearch
    ? clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : clients;

  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const paginated = sales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lifetimeValue = sales.filter((s) => s.status === "COMPLETED").reduce((acc, s) => acc + (s.total ?? 0), 0);
  const avgOrder = sales.length > 0 ? lifetimeValue / sales.filter((s) => s.status === "COMPLETED").length : 0;

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      searchPlaceholder="Buscar en historial..."
      headerRight={
        <button onClick={() => onNavigate("sales")}
          className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Venta
        </button>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Compras</h1>
            <p className="text-sm text-gray-500 mt-1">Revisá el historial de ventas por cliente.</p>
          </div>

          {/* Client selector */}
          <div className="w-full md:w-80 relative">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Seleccionar Cliente</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">person_search</span>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowDropdown(true); setSelectedClient(null); }}
                onFocus={() => setShowDropdown(true)}
                placeholder={loadingClients ? "Cargando clientes..." : "Buscar cliente..."}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">expand_more</span>
            </div>

            {showDropdown && clientSearch && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                {filteredClients.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : filteredClients.slice(0, 10).map((c) => (
                  <button key={c.id} onClick={() => loadHistory(c)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPIs del cliente seleccionado */}
        {selectedClient && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Valor de vida</p>
              <p className="text-3xl font-bold text-gray-900 font-mono">${lifetimeValue.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Total Transacciones</p>
              <p className="text-3xl font-bold text-gray-900">{sales.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ticket Promedio</p>
              <p className="text-3xl font-bold text-gray-900 font-mono">${isNaN(avgOrder) || !isFinite(avgOrder) ? "0.00" : avgOrder.toFixed(2)}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        {/* Tabla */}
        {!selectedClient && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-gray-200">manage_search</span>
            <p className="text-gray-400 mt-3">Seleccioná un cliente para ver su historial</p>
          </div>
        )}

        {selectedClient && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-sm font-bold">
                  {getInitials(selectedClient.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-xs text-gray-400">{sales.length} transacciones</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Order ID", "Fecha", "Items", "Total", "Estado", "Acción"].map((h) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Total" ? "text-right" : ""} ${h === "Acción" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Este cliente no tiene ventas registradas.</td></tr>
                  ) : (
                    paginated.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 px-4 font-mono text-sm text-gray-400">ORD-{sale.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(sale.date).toLocaleDateString("es-AR")}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{sale.items?.length ?? 0} producto(s)</td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-gray-800">${Number(sale.total).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[sale.status] ?? ""}`}>
                            {STATUS_LABELS[sale.status] ?? sale.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => setDetail(sale)}
                            className="text-[#0058be] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">{sales.length} transacciones</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${p === page ? "bg-[#0058be] text-white" : "text-gray-500 hover:bg-gray-200"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detail && <SaleDetailPanel sale={detail} onClose={() => setDetail(null)} />}
    </Layout>
  );
}
