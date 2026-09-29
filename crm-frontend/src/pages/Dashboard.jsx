import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, SkeletonRows, ErrorBanner, fmtMoney, fmtNum } from "../components/ui";
import { NewSaleModal } from "./Sales";

function KpiCard({ icon, label, value, sub, chipLabel }) {
  return (
    <article className="metric-card">
      <div className="metric-card-topline">
        <span className="metric-card-icon"><i className={`ti ${icon}`} aria-hidden="true" /></span>
        <span className="metric-card-period">{chipLabel}</span>
      </div>
      <span className="metric-card-label">{label}</span>
      <strong className="metric-card-value">{value}</strong>
      {sub && (
        <div className="metric-card-subline">
          <i className="ti ti-trending-up" aria-hidden="true" />
          {sub}
        </div>
      )}
    </article>
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

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      showSearch={false}
      headerRight={
        <button style={S.btnPrimary} onClick={() => setShowSaleModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> Nueva Venta
        </button>
      }>

      <div className="page-stack dashboard-page">
        <div className="page-heading">
          <div>
            <span className="page-kicker">Actividad comercial</span>
            <h1>Resumen</h1>
            <p>Una lectura rápida del rendimiento y los movimientos recientes.</p>
          </div>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchStats} />}

        <div className="metric-grid">
          <KpiCard
            icon="ti-receipt"
            label="Total ventas"
            value={loading ? "-" : fmtNum(stats?.totalSales)}
            sub={stats ? `${fmtNum(stats.salesThisMonth)} este mes` : null}
            chipLabel="Acumulado"
          />
          <KpiCard
            icon="ti-chart-line"
            label="Ingresos este mes"
            value={loading ? "-" : fmtMoney(stats?.revenueThisMonth)}
            chipLabel="Mes actual"
          />
          <KpiCard
            icon="ti-wallet"
            label="Ingresos totales"
            value={loading ? "-" : fmtMoney(stats?.totalRevenue)}
            chipLabel="Histórico"
          />
        </div>

        <div className="dashboard-grid">
          <section className="data-panel">
            <header className="data-panel-header">
              <div>
                <h2>Productos con más movimiento</h2>
                <span>Ordenados por unidades vendidas</span>
              </div>
              <button className="panel-link" onClick={() => onNavigate("products")}>Ver productos <i className="ti ti-arrow-right" aria-hidden="true" /></button>
            </header>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>Producto</th>
                <th style={{ ...S.th, textAlign: "right" }}>Cant.</th>
                <th style={{ ...S.th, textAlign: "right" }}>Ingresos</th>
              </tr></thead>
              <tbody>
                {loading ? <SkeletonRows cols={3} rows={5} /> :
                  !stats?.topProducts?.length
                    ? <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#64748B", padding: "30px" }}>Sin datos aún</td></tr>
                    : stats.topProducts.map((p, i) => (
                      <tr key={p.productId}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#E8EFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600", color: "#172033", flexShrink: 0 }}>{i + 1}</span>
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>{p.productName}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", color: "#64748B" }}>{fmtNum(p.totalQuantitySold)}</td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", fontWeight: "500" }}>{fmtMoney(p.totalRevenue)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>

          <section className="data-panel">
            <header className="data-panel-header">
              <div>
                <h2>Clientes con mayor actividad</h2>
                <span>Ordenados por valor acumulado</span>
              </div>
              <button className="panel-link" onClick={() => onNavigate("clients")}>Ver clientes <i className="ti ti-arrow-right" aria-hidden="true" /></button>
            </header>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>Cliente</th>
                <th style={{ ...S.th, textAlign: "right" }}>Compras</th>
                <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              </tr></thead>
              <tbody>
                {loading ? <SkeletonRows cols={3} rows={5} /> :
                  !stats?.topClients?.length
                    ? <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#64748B", padding: "30px" }}>Sin datos aún</td></tr>
                    : stats.topClients.map((c) => (
                      <tr key={c.clientId}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Avatar name={c.clientName} size={24} fontSize={9} />
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>{c.clientName}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", color: "#64748B" }}>{fmtNum(c.totalPurchases)}</td>
                        <td style={{ ...S.td, textAlign: "right", fontSize: "13px", fontWeight: "500" }}>{fmtMoney(c.totalSpent)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </section>
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
