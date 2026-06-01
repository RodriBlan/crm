import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, getInitials, StatusBadge, SkeletonRows, Pagination, ErrorBanner, fmtMoney } from "../components/ui";

function SaleDetailPanel({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(27,58,107,0.3)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", width: "320px", height: "100%", boxShadow: "-4px 0 30px rgba(27,58,107,0.12)", display: "flex", flexDirection: "column", zIndex: 10 }}>
        <div style={{ background: "#1B3A6B", padding: "22px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "6px", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px 8px", display: "flex" }}>
              <i className="ti ti-x" style={{ fontSize: "16px" }} aria-hidden="true" />
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Orden #{sale.id}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{new Date(sale.date).toLocaleDateString("es-AR")}</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <StatusBadge status={sale.status} />
            <span style={{ fontSize: "20px", fontWeight: "500", color: "#1B3A6B", fontFamily: "monospace" }}>{fmtMoney(sale.total)}</span>
          </div>
          {sale.notes && (
            <div style={{ background: "#FAEEDA", border: "0.5px solid rgba(239,159,39,0.3)", borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Notas</div>
              <p style={{ fontSize: "13px", color: "#1B3A6B", margin: 0 }}>{sale.notes}</p>
            </div>
          )}
          <div>
            <div style={{ fontSize: "10px", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Items</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {sale.items?.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F0F4FA", borderRadius: "8px", padding: "10px 12px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#1B3A6B" }}>{item.productName}</div>
                    <div style={{ fontSize: "11px", color: "#6B89B8", marginTop: "2px" }}>{item.quantity} × ${Number(item.unitPrice).toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: "500", color: "#1B3A6B" }}>${Number(item.subtotal).toFixed(2)}</span>
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
  const PAGE_SIZE = 9;

  useEffect(() => {
    apiFetch("/clients").then((r) => r?.json()).then((d) => { if (Array.isArray(d)) setClients(d); }).catch(() => {}).finally(() => setLoadingClients(false));
  }, []);

  async function loadHistory(client) {
    setSelectedClient(client); setClientSearch(client.name); setShowDropdown(false);
    setSales([]); setError(null); setLoading(true); setPage(1);
    try {
      const res = await apiFetch(`/sales/client/${client.id}`);
      if (!res?.ok) throw new Error("No se pudo cargar el historial.");
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
  const completed = sales.filter((s) => s.status === "COMPLETED").length;
  const avgOrder = completed > 0 ? lifetimeValue / completed : 0;

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}
      searchPlaceholder="Buscar en historial..."
      headerRight={
        <button style={S.btnPrimary} onClick={() => onNavigate("sales")}>
          <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> Nueva Venta
        </button>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header + selector */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", borderBottom: "0.5px solid rgba(27,58,107,0.1)", paddingBottom: "18px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#1B3A6B", margin: 0 }}>Historial de Compras</h1>
            <p style={{ fontSize: "13px", color: "#6B89B8", marginTop: "4px" }}>Revisá el historial de ventas por cliente</p>
          </div>

          {/* Client selector */}
          <div style={{ width: "280px", position: "relative" }}>
            <div style={{ fontSize: "10px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Seleccionar Cliente</div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: "#fff", border: "0.5px solid rgba(27,58,107,0.15)", borderRadius: "8px", padding: "8px 12px", gap: "8px" }}>
              <i className="ti ti-user-search" style={{ fontSize: "15px", color: "#6B89B8", flexShrink: 0 }} aria-hidden="true" />
              <input type="text" value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowDropdown(true); setSelectedClient(null); }}
                onFocus={() => setShowDropdown(true)}
                placeholder={loadingClients ? "Cargando..." : "Buscar cliente..."}
                style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "#1B3A6B", flex: 1 }} />
              <i className="ti ti-chevron-down" style={{ fontSize: "14px", color: "#6B89B8", flexShrink: 0 }} aria-hidden="true" />
            </div>
            {showDropdown && clientSearch && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "#fff", border: "0.5px solid rgba(27,58,107,0.1)", borderRadius: "8px", boxShadow: "0 8px 24px rgba(27,58,107,0.1)", maxHeight: "200px", overflowY: "auto", zIndex: 20 }}>
                {filteredClients.length === 0 ? (
                  <p style={{ padding: "12px", fontSize: "13px", color: "#6B89B8" }}>Sin resultados</p>
                ) : filteredClients.slice(0, 10).map((c) => (
                  <button key={c.id} onClick={() => loadHistory(c)}
                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", borderBottom: "0.5px solid rgba(27,58,107,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                    <Avatar name={c.name} size={26} fontSize={9} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#1B3A6B" }}>{c.name}</div>
                      <div style={{ fontSize: "11px", color: "#6B89B8" }}>{c.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPIs del cliente */}
        {selectedClient && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              { label: "Valor de vida", value: fmtMoney(lifetimeValue), icon: "ti-coins", bg: "#DCE8F8", color: "#1B3A6B" },
              { label: "Transacciones", value: sales.length, icon: "ti-receipt", bg: "#E1F5EE", color: "#0F6E56" },
              { label: "Ticket promedio", value: fmtMoney(avgOrder), icon: "ti-chart-bar", bg: "#FAEEDA", color: "#854F0B" },
            ].map((k) => (
              <div key={k.label} style={{ ...S.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`ti ${k.icon}`} style={{ fontSize: "16px", color: k.color }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500" }}>{k.label}</div>
                  <div style={{ fontSize: "18px", fontWeight: "500", color: "#1B3A6B", marginTop: "2px" }}>{k.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        {/* Placeholder sin cliente */}
        {!selectedClient && !loading && (
          <div style={{ ...S.card, padding: "60px", textAlign: "center" }}>
            <i className="ti ti-search" style={{ fontSize: "40px", color: "#DCE8F8", display: "block", marginBottom: "12px" }} aria-hidden="true" />
            <p style={{ fontSize: "14px", color: "#6B89B8", margin: 0 }}>Seleccioná un cliente para ver su historial</p>
          </div>
        )}

        {/* Tabla */}
        {selectedClient && (
          <div style={S.card}>
            <div style={{ padding: "14px 16px", borderBottom: "0.5px solid rgba(27,58,107,0.08)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar name={selectedClient.name} size={30} fontSize={11} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#1B3A6B" }}>{selectedClient.name}</div>
                <div style={{ fontSize: "11px", color: "#6B89B8" }}>{sales.length} transacciones</div>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                <thead>
                  <tr>
                    {["Orden ID", "Fecha", "Items", "Total", "Estado", ""].map((h, i) => (
                      <th key={i} style={{ ...S.th, textAlign: h === "Total" ? "right" : h === "" ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? <SkeletonRows cols={6} rows={5} /> :
                    paginated.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#6B89B8", padding: "40px" }}>Sin ventas registradas para este cliente.</td></tr>
                    ) : paginated.map((sale) => (
                      <tr key={sale.id}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px", color: "#6B89B8" }}>ORD-{sale.id}</td>
                        <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8" }}>{new Date(sale.date).toLocaleDateString("es-AR")}</td>
                        <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8" }}>{sale.items?.length ?? 0} producto(s)</td>
                        <td style={{ ...S.td, textAlign: "right", fontFamily: "monospace", fontSize: "13px", fontWeight: "500" }}>{fmtMoney(sale.total)}</td>
                        <td style={S.td}><StatusBadge status={sale.status} /></td>
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <button onClick={() => setDetail(sale)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#378ADD", opacity: 0, transition: "opacity 0.15s" }}
                            className="row-actions">
                            Ver →
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(27,58,107,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#6B89B8" }}>{sales.length} transacciones</span>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          </div>
        )}
      </div>

      {detail && <SaleDetailPanel sale={detail} onClose={() => setDetail(null)} />}
    </Layout>
  );
}
