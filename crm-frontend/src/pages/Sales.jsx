import { useState, useEffect } from "react";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, Button, PageHeader, StatusBadge, SkeletonRows, Pagination, ErrorBanner, FormField, fmtMoney } from "../components/ui";
import SaleDetailDrawer from "../components/SaleDetailDrawer";
import Icon from "../components/Icon";

// Este es el fragmento del NewSaleModal con el buscador de productos mejorado.
// Reemplazá el componente NewSaleModal completo en Sales.jsx con este.

export function NewSaleModal({ onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  // ← NUEVO: búsqueda de producto por item
  const [productSearches, setProductSearches] = useState([""]);
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/clients").then((r) => r?.json()).then((d) => Array.isArray(d) && setClients(d)).catch(() => {});
    apiFetch("/products").then((r) => r?.json()).then((d) => { const l = d?.content ?? d; if (Array.isArray(l)) setProducts(l); }).catch(() => {});
  }, []);

  const filteredClients = clientSearch
    ? clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : clients;

  // Filtrar productos por búsqueda de texto para cada item
  function filteredProducts(i) {
    const q = productSearches[i]?.toLowerCase() ?? "";
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }

  function addItem() {
    setItems((p) => [...p, { productId: "", quantity: 1 }]);
    setProductSearches((p) => [...p, ""]);
  }

  function removeItem(i) {
    setItems((p) => p.filter((_, idx) => idx !== i));
    setProductSearches((p) => p.filter((_, idx) => idx !== i));
  }

  function updateItem(i, field, value) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function updateProductSearch(i, value) {
    setProductSearches((p) => p.map((s, idx) => idx === i ? value : s));
    // Si cambia la búsqueda, resetear el producto seleccionado del item
    updateItem(i, "productId", "");
  }

  function selectProduct(i, product) {
    updateItem(i, "productId", product.id);
    setProductSearches((p) => p.map((s, idx) => idx === i ? product.name : s));
  }

  function calcTotal() {
    return items.reduce((acc, item) => {
      const p = products.find((p) => String(p.id) === String(item.productId));
      return acc + (p ? p.price * (item.quantity || 0) : 0);
    }, 0);
  }

  async function handleSubmit(status = "COMPLETED") {
    if (!clientId) { setError("Seleccioná un cliente."); return; }
    if (items.some((i) => !i.productId)) { setError("Todos los items necesitan un producto."); return; }
    if (items.some((i) => !i.quantity || i.quantity < 1)) { setError("La cantidad debe ser al menos 1."); return; }
    for (const item of items) {
      const p = products.find((p) => String(p.id) === String(item.productId));
      if (p && parseInt(item.quantity) > p.stock) {
        setError(`Stock insuficiente para "${p.name}". Disponible: ${p.stock}, solicitado: ${item.quantity}.`);
        return;
      }
    }
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify({
          clientId: parseInt(clientId),
          notes, status,
          items: items.map((i) => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) })),
        }),
      });
      if (!res) return;
      if (!res.ok) { setError(await readErrorMessage(res)); return; }
      onSave(await res.json());
    } catch { setError("Error al conectarse con el servidor."); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(23,32,51,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="app-modal app-modal-wide" style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(23,32,51,0.15)" }}>
        <div className="app-modal-header" style={{ padding: "18px 22px", borderBottom: "0.5px solid rgba(23,32,51,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#172033" }}>Registrar Nueva Venta</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
            <Icon name="x" size={19} />
          </button>
        </div>

        <div className="app-modal-body sale-modal-body" style={{ padding: "20px 22px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#A32D2D" }}>
              <Icon name="alert-circle" size={16} />{error}
            </div>
          )}

          {/* Cliente */}
          <FormField label="Cliente *">
            <input type="text" placeholder="Buscar cliente..." value={clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setClientId(""); }} style={S.input} />
            {clientSearch && !clientId && (
              <div style={{ border: "0.5px solid rgba(23,32,51,0.12)", borderRadius: "8px", maxHeight: "160px", overflowY: "auto", background: "#fff", boxShadow: "0 4px 12px rgba(23,32,51,0.08)" }}>
                {filteredClients.length === 0
                  ? <p style={{ padding: "10px 12px", fontSize: "13px", color: "#64748B" }}>Sin resultados</p>
                  : filteredClients.map((c) => (
                    <button key={c.id} onClick={() => { setClientId(c.id); setClientSearch(c.name); }}
                      style={{ width: "100%", textAlign: "left", padding: "9px 12px", background: "none", border: "none", borderBottom: "0.5px solid rgba(23,32,51,0.06)", cursor: "pointer", fontSize: "13px", color: "#172033", display: "flex", alignItems: "center", gap: "8px" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                      <Avatar name={c.name} size={22} fontSize={8} />
                      {c.name} <span style={{ color: "#64748B", fontSize: "11px" }}>{c.phone}</span>
                    </button>
                  ))}
              </div>
            )}
            {clientId && (
              <div style={{ fontSize: "11px", color: "#0F6E56", display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon name="circle-check" size={14} />Cliente seleccionado
              </div>
            )}
          </FormField>

          <div style={{ borderTop: "0.5px solid rgba(23,32,51,0.08)", paddingTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Productos *</span>
              <button onClick={addItem} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#2563EB", display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon name="plus" size={15} /> Agregar item
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {items.map((item, i) => {
                const selectedProduct = products.find((p) => String(p.id) === String(item.productId));
                const stockWarning = selectedProduct && parseInt(item.quantity) > selectedProduct.stock;
                const filtered = filteredProducts(i);

                return (
                  <div key={i} style={{ background: stockWarning ? "#FCEBEB" : "#F4F6F9", border: `0.5px solid ${stockWarning ? "rgba(163,45,45,0.2)" : "rgba(23,32,51,0.08)"}`, borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      {/* Buscador de producto — campo de texto con dropdown */}
                      <div style={{ flex: 1, position: "relative" }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <Icon name="search" size={14} style={{ position: "absolute", left: "10px", pointerEvents: "none" }} />
                          <input
                            type="text"
                            value={productSearches[i] ?? ""}
                            onChange={(e) => updateProductSearch(i, e.target.value)}
                            placeholder="Buscar o escribir producto..."
                            style={{ ...S.input, paddingLeft: "32px", fontSize: "13px" }}
                          />
                          {/* Indicador de producto seleccionado */}
                          {item.productId && (
                            <Icon name="circle-check" size={15} style={{ position: "absolute", right: "10px", pointerEvents: "none" }} />
                          )}
                        </div>

                        {/* Dropdown de sugerencias */}
                        {productSearches[i] && !item.productId && filtered.length > 0 && (
                          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#fff", border: "0.5px solid rgba(23,32,51,0.12)", borderRadius: "8px", boxShadow: "0 4px 16px rgba(23,32,51,0.1)", maxHeight: "160px", overflowY: "auto", zIndex: 10 }}>
                            {filtered.map((p) => (
                              <button key={p.id} onClick={() => selectProduct(i, p)}
                                style={{ width: "100%", textAlign: "left", padding: "9px 12px", background: "none", border: "none", borderBottom: "0.5px solid rgba(23,32,51,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                                <div>
                                  <div style={{ fontSize: "13px", color: "#172033", fontWeight: "500" }}>{p.name}</div>
                                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>${Number(p.price).toFixed(2)} · stock: {p.stock}</div>
                                </div>
                                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: "500" }}>${Number(p.price).toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Info del producto seleccionado */}
                        {selectedProduct && (
                          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "flex", gap: "8px" }}>
                            <span>${Number(selectedProduct.price).toFixed(2)} c/u</span>
                            <span>·</span>
                            <span>Stock: {selectedProduct.stock}</span>
                          </div>
                        )}
                      </div>

                      {/* Cantidad */}
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        style={{ ...S.input, width: "70px", fontFamily: "monospace", textAlign: "center", border: stockWarning ? "0.5px solid rgba(163,45,45,0.3)" : S.input.border }}
                        placeholder="Cant." />

                      {/* Eliminar item */}
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "8px 4px", display: "flex", flexShrink: 0 }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#A32D2D"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}>
                          <Icon name="trash" size={16} />
                        </button>
                      )}
                    </div>

                    {stockWarning && (
                      <div style={{ fontSize: "11px", color: "#A32D2D", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                        <Icon name="alert-triangle" size={14} />
                        Stock insuficiente — disponible: {selectedProduct.stock}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <FormField label="Notas (opcional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Ej: ya se pagó una parte, entrega a domicilio..."
              style={{ ...S.input, resize: "none" }} />
          </FormField>

          {/* Total */}
          <div style={{ background: "#F4F6F9", border: "0.5px solid rgba(23,32,51,0.1)", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>Total estimado</span>
            <span style={{ fontSize: "22px", fontWeight: "600", color: "#172033" }}>${calcTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="app-modal-footer" style={{ padding: "14px 22px", borderTop: "0.5px solid rgba(23,32,51,0.1)", display: "flex", justifyContent: "flex-end", gap: "8px", flexShrink: 0 }}>
          <button style={S.btnSecondary} onClick={onClose}>Cancelar</button>
          <button style={S.btnWarning} onClick={() => handleSubmit("PENDING")} disabled={loading}>
            <Icon name="clock" size={15} /> Dejar Pendiente
          </button>
          <button className="icon-inverse" style={S.btnPrimary} onClick={() => handleSubmit("COMPLETED")} disabled={loading}>
            {loading && <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
            <Icon name="check" size={15} /> Guardar Venta
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
  const PAGE_SIZE = 9;

  async function fetchSales() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/sales");
      if (!res?.ok) throw new Error("Error al cargar ventas.");
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

  function handleSave(saved) { setSales((p) => [saved, ...p]); setModal(false); }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta venta? Se devolverá el stock.")) return;
    try {
      const res = await apiFetch(`/sales/${id}`, { method: "DELETE" });
      if (!res?.ok) throw new Error("Error al eliminar.");
      setSales((p) => p.filter((s) => s.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (err) { alert(err.message); }
  }

  async function handleStatusChange(id, status) {
    try {
      const res = await apiFetch(`/sales/${id}/status?status=${status}`, { method: "PATCH" });
      if (!res?.ok) { alert(await readErrorMessage(res)); return; }
      const updated = await res.json();
      setSales((p) => p.map((s) => s.id === id ? updated : s));
      if (detail?.id === id) setDetail(updated);
    } catch (err) { alert(err.message); }
  }

  const totalVolume = sales.filter((s) => s.status === "COMPLETED").reduce((acc, s) => acc + (s.total ?? 0), 0);
  const pending = sales.filter((s) => s.status === "PENDING").length;

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} searchPlaceholder="Buscar por cliente..." searchValue={search} onSearch={setSearch}>
      <div className="page-stack">
        <PageHeader eyebrow="Operaciones" title="Ventas" description="Seguimiento de transacciones, importes y estados." actions={<Button icon="ti-plus" onClick={() => setModal(true)}>Nueva venta</Button>} meta={`${filtered.length} visibles`} />
        <div className="sales-summary-bar">
          <div className="page-inline-metrics">
            {[
              { label: "Volumen total", value: fmtMoney(totalVolume), color: "#172033" },
              { label: "Pendientes", value: pending, color: "#2563EB" },
            ].map((k) => (
              <div className="page-inline-metric" key={k.label}>
                <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500" }}>{k.label}</div>
                <div style={{ fontSize: "18px", fontWeight: "500", color: k.color, marginTop: "4px" }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="filter-bar">
          <Icon name="filter" size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...S.input, width: "auto", appearance: "none", border: "none", background: "none", padding: "0", fontSize: "13px", color: "#172033", cursor: "pointer" }}>
            <option value="ALL">Todos los estados</option>
            <option value="COMPLETED">Completadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchSales} />}

        <div className="ui-data-panel">
          <div className="table-scroll">
            <table className="ui-table sales-table">
              <thead>
                <tr>
                  {["ID", "Fecha", "Cliente", "Total", "Estado", ""].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: h === "Total" || h === "" ? "right" : h === "Estado" ? "center" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRows cols={6} rows={6} /> :
                  paginated.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#64748B", padding: "40px" }}>No hay ventas que mostrar.</td></tr>
                  ) : paginated.map((sale) => (
                    <tr key={sale.id} style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => setDetail(sale)}>
                      <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>#{sale.id}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#64748B", whiteSpace: "nowrap" }}>{new Date(sale.date).toLocaleDateString("es-AR")}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Avatar name={sale.clientName} size={26} fontSize={9} />
                          <span style={{ fontSize: "13px", fontWeight: "500" }}>{sale.clientName}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, textAlign: "right", fontFamily: "monospace", fontSize: "13px", fontWeight: "500" }}>{fmtMoney(sale.total)}</td>
                      <td style={{ ...S.td, textAlign: "center" }}><StatusBadge status={sale.status} /></td>
                      <td style={{ ...S.td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", opacity: 0, transition: "opacity 0.15s" }}>
                          {sale.status === "PENDING" && (
                            <button onClick={() => handleStatusChange(sale.id, "COMPLETED")} title="Completar"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px 5px", borderRadius: "6px", display: "flex" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#E1F5EE"; e.currentTarget.style.color = "#0F6E56"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748B"; }}>
                              <Icon name="circle-check" size={16} />
                            </button>
                          )}
                          {sale.status !== "CANCELLED" && (
                            <button onClick={() => handleStatusChange(sale.id, "CANCELLED")} title="Cancelar"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px 5px", borderRadius: "6px", display: "flex" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#FAEEDA"; e.currentTarget.style.color = "#854F0B"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748B"; }}>
                              <Icon name="ban" size={16} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(sale.id)} title="Eliminar"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px 5px", borderRadius: "6px", display: "flex" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#A32D2D"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748B"; }}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span style={{ fontSize: "12px", color: "#64748B" }}>{filtered.length} ventas</span>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {detail && <SaleDetailDrawer sale={detail} onClose={() => setDetail(null)} />}
      {modal && <NewSaleModal onClose={() => setModal(false)} onSave={handleSave} />}
    </Layout>
  );
}
