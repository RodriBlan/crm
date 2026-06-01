import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, SkeletonRows, ErrorBanner, fmtMoney, fmtNum } from "../components/ui";
import { NewSaleModal } from "./Sales";

function KpiCard({ icon, label, value, sub, chipLabel, chipBg, chipColor }) {
  return (
    <div style={{ ...S.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: chipBg, color: chipColor }}>{chipLabel}</span>
      </div>
      {/* Valor en formato distendido — fuente normal, no monospace */}
      <div style={{ fontSize: "28px", fontWeight: "600", color: "#1B3A6B", letterSpacing: "-0.01em" }}>{value}</div>
      {sub && (
        <div style={{ fontSize: "12px", color: "#6B89B8", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
          <i className="ti ti-trending-up" style={{ fontSize: "13px", color: "#0F6E56" }} aria-hidden="true" />
          {sub}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ currentPage, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  async function fetchStats() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/stats");
      if (!res?.ok) throw new Error("No se pudieron cargar las estadísticas.");
      setStats(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchStats(); }, []);

  // Formato distendido para dinero — sin decimales, con separador
  function fmtMoneyRelaxed(n) {
    if (n == null) return "—";
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1).replace(".", ",") + "M";
    if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
    return "$" + Math.round(n).toLocaleString("es-AR");
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      showSearch={false}  /* ← sin barra de búsqueda en dashboard */
      headerRight={
        <button style={S.btnPrimary} onClick={() => setShowSaleModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> Nueva Venta
        </button>
      }>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#1B3A6B", margin: 0 }}>Overview</h1>
          <p style={{ fontSize: "13px", color: "#6B89B8", marginTop: "4px" }}>Métricas clave y top performers</p>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchStats} />}

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <KpiCard
            label="Total ventas"
            value={loading ? "—" : fmtNum(stats?.totalSales)}
            sub={stats ? `${fmtNum(stats.salesThisMonth)} este mes` : null}
            chipLabel="ventas" chipBg="#DCE8F8" chipColor="#1B3A6B"
          />
          <KpiCard
            label="Ingresos este mes"
            value={loading ? "—" : fmtMoneyRelaxed(stats?.revenueThisMonth)}
            chipLabel="mensual" chipBg="#E1F5EE" chipColor="#0F6E56"
          />
          <KpiCard
            label="Ingresos totales"
            value={loading ? "—" : fmtMoneyRelaxed(stats?.totalRevenue)}
            chipLabel="total" chipBg="#FAEEDA" chipColor="#854F0B"
          />
        </div>

        {/* Tables */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* Top productos */}
          <div style={S.card}>
            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(27,58,107,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1B3A6B" }}>Top productos</span>
              <button onClick={() => onNavigate("products")} style={{ background: "none", border: "none", fontSize: "12px", color: "#378ADD", cursor: "pointer" }}>Ver todos →</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>Producto</th>
                <th style={{ ...S.th, textAlign: "right" }}>Cant.</th>
                <th style={{ ...S.th, textAlign: "right" }}>Ingresos</th>
              </tr></thead>
              <tbody>
                {loading ? <SkeletonRows cols={3} rows={5} /> :
                  !stats?.topProducts?.length
                    ? <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#6B89B8", padding: "30px" }}>Sin datos aún</td></tr>
                    : stats.topProducts.map((p, i) => (
                      <tr key={p.productId}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#DCE8F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600", color: "#1B3A6B", flexShrink: 0 }}>{i + 1}</span>
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>{p.productName}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", color: "#6B89B8" }}>{fmtNum(p.totalQuantitySold)}</td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", fontWeight: "500" }}>{fmtMoneyRelaxed(p.totalRevenue)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Top clientes */}
          <div style={S.card}>
            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(27,58,107,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1B3A6B" }}>Top clientes</span>
              <button onClick={() => onNavigate("clients")} style={{ background: "none", border: "none", fontSize: "12px", color: "#378ADD", cursor: "pointer" }}>Ver todos →</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>Cliente</th>
                <th style={{ ...S.th, textAlign: "right" }}>Compras</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              </tr></thead>
              <tbody>
                {loading ? <SkeletonRows cols={3} rows={5} /> :
                  !stats?.topClients?.length
                    ? <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#6B89B8", padding: "30px" }}>Sin datos aún</td></tr>
                    : stats.topClients.map((c) => (
                      <tr key={c.clientId}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Avatar name={c.clientName} size={24} fontSize={9} />
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>{c.clientName}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", color: "#6B89B8" }}>{fmtNum(c.totalPurchases)}</td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", fontWeight: "500" }}>{fmtMoneyRelaxed(c.totalSpent)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSaleModal && (
        <NewSaleModal
          onClose={() => setShowSaleModal(false)}
          onSave={() => { setShowSaleModal(false); fetchStats(); }}
        />
      )}
    </Layout>
  );
}
