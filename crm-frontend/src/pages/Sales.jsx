import { useState, useEffect } from "react";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";

const STATUS_STYLES = {
  COMPLETED: "bg-green-50 border-green-300 text-green-700",
  PENDING: "bg-blue-50 border-blue-300 text-blue-700",
  CANCELLED: "bg-red-50 border-red-300 text-red-700",
};
const STATUS_LABELS = { COMPLETED: "Completada", PENDING: "Pendiente", CANCELLED: "Cancelada" };

function SaleDetailPanel({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col overflow-y-auto z-10">
        <div className="bg-[#131b2e] text-white p-6 flex items-start justify-between shrink-0">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Venta #{sale.id}</p>
            <h2 className="font-bold text-lg mt-1">{sale.clientName}</h2>
            <p className="text-white/60 text-sm mt-1">{new Date(sale.date).toLocaleDateString("es-AR")}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[sale.status] ?? ""}`}>
              {STATUS_LABELS[sale.status] ?? sale.status}
            </span>
            <span className="text-2xl font-bold text-gray-900 font-mono">${Number(sale.total).toFixed(2)}</span>
          </div>
          {sale.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notas</p>
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

 function NewSaleModal({ onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/clients").then((r) => r?.json()).then((d) => Array.isArray(d) && setClients(d)).catch(() => {});
    apiFetch("/products").then((r) => r?.json()).then((d) => {
      const list = d?.content ?? d;
      if (Array.isArray(list)) setProducts(list);
    }).catch(() => {});
  }, []);

  const filteredClients = clientSearch
    ? clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : clients;

  function addItem() { setItems((prev) => [...prev, { productId: "", quantity: 1 }]); }
  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateItem(i, field, value) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function calcTotal() {
    return items.reduce((acc, item) => {
      const product = products.find((p) => String(p.id) === String(item.productId));
      if (!product) return acc;
      return acc + (product.price * (item.quantity || 0));
    }, 0);
  }

  // Este es solo el fragmento de handleSubmit del NewSaleModal en Sales.jsx
// Reemplazá la función handleSubmit existente con esta versión

async function handleSubmit(status = "COMPLETED") {
  if (!clientId) { setError("Seleccioná un cliente."); return; }
  if (items.some((i) => !i.productId)) { setError("Todos los items necesitan un producto."); return; }
  if (items.some((i) => !i.quantity || i.quantity < 1)) { setError("La cantidad debe ser al menos 1."); return; }

  // ── Validación de stock ANTES de enviar al backend ──
  for (const item of items) {
    const product = products.find((p) => String(p.id) === String(item.productId));
    if (product && parseInt(item.quantity) > product.stock) {
      setError(
        `Stock insuficiente para "${product.name}". ` +
        `Disponible: ${product.stock}, solicitado: ${item.quantity}.`
      );
      return;
    }
  }

   setLoading(true); setError(null);
  try {
    const res = await apiFetch("/sales", {
      method: "POST",
      body: JSON.stringify({
        clientId: parseInt(clientId),
        notes,
        status,   // ← AGREGADO
        items: items.map((i) => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
        })),
      }),
    });

    if (!res) return; // redirigido al login

    if (!res.ok) {
      const msg = await readErrorMessage(res);
      setError(msg);
      return;
    }

    onSave(await res.json());
  } catch (err) {
    setError("Error al conectarse con el servidor.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">Registrar Nueva Venta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">

          {/* Error del backend — ahora muestra el mensaje real */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Cliente */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente *</label>
            <input type="text" placeholder="Buscar cliente..." value={clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setClientId(""); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
            {clientSearch && !clientId && (
              <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm">
                {filteredClients.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : filteredClients.map((c) => (
                  <button key={c.id} onClick={() => { setClientId(c.id); setClientSearch(c.name); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    {c.name} <span className="text-gray-400 text-xs">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {clientId && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Cliente seleccionado
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Productos *</label>
              <button onClick={addItem} className="text-[#0058be] text-sm font-medium flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[16px]">add_circle</span> Agregar item
              </button>
            </div>
            {items.map((item, i) => {
              const selectedProduct = products.find((p) => String(p.id) === String(item.productId));
              const stockWarning = selectedProduct && item.quantity > selectedProduct.stock;
              return (
                <div key={i} className={`flex flex-col gap-2 bg-gray-50 rounded-lg p-3 border ${stockWarning ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                  <div className="flex gap-3 items-center">
                    <select value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all bg-white">
                      <option value="">Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${Number(p.price).toFixed(2)} (stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input type="number" min="1" value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      className={`w-20 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-all bg-white ${stockWarning ? "border-red-300" : "border-gray-200"}`} />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {/* Advertencia de stock inline */}
                  {stockWarning && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Stock insuficiente — disponible: {selectedProduct.stock}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Pago en efectivo, entrega a domicilio..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none" />
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center border border-gray-200">
            <span className="text-sm font-semibold text-gray-500">Total estimado</span>
            <span className="text-2xl font-bold text-gray-900 font-mono">${calcTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
  <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
  <button onClick={() => handleSubmit("PENDING")} disabled={loading}
    className="px-4 py-2 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-700 text-sm font-medium hover:bg-yellow-100 transition-colors disabled:opacity-60 flex items-center gap-2">
    <span className="material-symbols-outlined text-[18px]">schedule</span>
    Dejar Pendiente
  </button>
  <button onClick={() => handleSubmit("COMPLETED")} disabled={loading}
    className="px-4 py-2 rounded-lg bg-[#0058be] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
    <span className="material-symbols-outlined text-[18px]">save</span>
    Guardar Venta
  </button>
</div>
      </div>
    </div>
  );
}

export default function Sales({ currentPage, onNavigate }) {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  async function fetchSales() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/sales");
      if (!res.ok) throw new Error("No se pudieron cargar las ventas.");
      setSales(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchSales(); }, []);

  useEffect(() => {
    let list = sales;
    if (statusFilter !== "ALL") list = list.filter((s) => s.status === statusFilter);
    if (search) list = list.filter((s) => s.clientName?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list); setPage(1);
  }, [search, statusFilter, sales]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(saved) {
    setSales((prev) => [saved, ...prev]);
    setModal(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta venta? Se devolverá el stock.")) return;
    try {
      const res = await apiFetch(`/sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar.");
      setSales((prev) => prev.filter((s) => s.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (err) { alert(err.message); }
  }

  async function handleStatusChange(id, status) {
    try {
      const res = await apiFetch(`/sales/${id}/status?status=${status}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al cambiar estado.");
      const updated = await res.json();
      setSales((prev) => prev.map((s) => s.id === id ? updated : s));
      if (detail?.id === id) setDetail(updated);
    } catch (err) { alert(err.message); }
  }

  const totalVolume = sales.filter((s) => s.status === "COMPLETED").reduce((acc, s) => acc + (s.total ?? 0), 0);
  const pending = sales.filter((s) => s.status === "PENDING").length;

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      searchPlaceholder="Buscar por cliente..."
      searchValue={search}
      onSearch={setSearch}
      headerRight={
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Venta
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
            <p className="text-sm text-gray-500 mt-1">Gestioná y monitoreá tus transacciones.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col items-center shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Volumen total</span>
              <span className="text-xl font-bold text-gray-900 font-mono mt-1">${totalVolume.toFixed(2)}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col items-center shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pendientes</span>
              <span className="text-xl font-bold text-[#0058be] mt-1">{pending}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">filter_list</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition-all appearance-none">
              <option value="ALL">Todos los estados</option>
              <option value="COMPLETED">Completadas</option>
              <option value="PENDING">Pendientes</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
            <button onClick={fetchSales} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["ID", "Fecha", "Cliente", "Total", "Estado", "Acciones"].map((h) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${h === "Total" || h === "Acciones" ? "text-right" : ""} ${h === "Estado" ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No hay ventas que mostrar.</td></tr>
                ) : (
                  paginated.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => setDetail(sale)}>
                      <td className="py-3 px-4 font-mono text-sm text-gray-400">#{sale.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(sale.date).toLocaleDateString("es-AR")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {sale.clientName?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{sale.clientName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-gray-800">
                        ${Number(sale.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[sale.status] ?? ""}`}>
                          {STATUS_LABELS[sale.status] ?? sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {sale.status === "PENDING" && (
                            <button onClick={() => handleStatusChange(sale.id, "COMPLETED")}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Completar">
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
                          {sale.status !== "CANCELLED" && (
                            <button onClick={() => handleStatusChange(sale.id, "CANCELLED")}
                              className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors" title="Cancelar">
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          )}
                          <button onClick={() => handleDelete(sale.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
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
            <span className="text-sm text-gray-500">{filtered.length} ventas</span>
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
      </div>

      {detail && <SaleDetailPanel sale={detail} onClose={() => setDetail(null)} />}
      {modal && <NewSaleModal onClose={() => setModal(false)} onSave={handleSave} />}
    </Layout>
  );
}
