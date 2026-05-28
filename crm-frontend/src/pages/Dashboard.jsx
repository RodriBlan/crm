import { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import Layout from "../components/Layout";


function StatCard({ icon, label, value, sub, subColor = "text-green-600" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="material-symbols-outlined text-[22px] text-[#0058be]">{icon}</span>
      </div>
      <div className="text-4xl font-bold text-gray-900 font-mono mt-1">{value}</div>
      {sub && <div className={`text-sm font-medium ${subColor} flex items-center gap-1`}>{sub}</div>}
    </div>
  );
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function Dashboard({ currentPage, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  async function fetchStats() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/stats");
      if (!res.ok) throw new Error("No se pudieron cargar las estadísticas.");
      setStats(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  function fmt(n) {
    if (n == null) return "—";
    return Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function fmtMoney(n) {
    if (n == null) return "—";
    return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <>
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      searchPlaceholder="Buscar en el CRM..."
      headerRight={
       <button
    onClick={() => onNavigate("sales")}
    className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
  >
    <span className="material-symbols-outlined text-[18px]">add</span>
    Nueva Venta
  </button>
}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Tus métricas clave y top performers.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
            <button onClick={fetchStats} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon="shopping_bag"
            label="Total Ventas"
            value={loading ? "—" : fmt(stats?.totalSales)}
          />
          <StatCard
            icon="account_balance_wallet"
            label="Ingresos Este Mes"
            value={loading ? "—" : fmtMoney(stats?.revenueThisMonth)}
            sub={stats ? `${fmt(stats.salesThisMonth)} ventas este mes` : null}
          />
          <StatCard
            icon="monetization_on"
            label="Ingresos Totales"
            value={loading ? "—" : fmtMoney(stats?.totalRevenue)}
          />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Top Products */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Top 5 Productos más vendidos</h2>
              <button onClick={() => onNavigate("products")} className="text-sm text-[#0058be] hover:underline">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Producto</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Cant.</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                        <td className="px-5 py-3"><div className="h-4 bg-gray-200 rounded w-12 ml-auto" /></td>
                        <td className="px-5 py-3"><div className="h-4 bg-gray-200 rounded w-20 ml-auto" /></td>
                      </tr>
                    ))
                  ) : !stats?.topProducts?.length ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">Sin datos aún</td></tr>
                  ) : (
                    stats.topProducts.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                            <span className="text-sm font-semibold text-gray-800">{p.productName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-sm text-gray-500">{fmt(p.totalQuantitySold)}</td>
                        <td className="px-5 py-3 text-right font-mono text-sm text-gray-800">{fmtMoney(p.totalRevenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Top 5 Clientes por compras</h2>
              <button onClick={() => onNavigate("clients")} className="text-sm text-[#0058be] hover:underline">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Compras</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200" /><div className="h-4 bg-gray-200 rounded w-32" /></div></td>
                        <td className="px-5 py-3"><div className="h-4 bg-gray-200 rounded w-12 ml-auto" /></td>
                        <td className="px-5 py-3"><div className="h-4 bg-gray-200 rounded w-20 ml-auto" /></td>
                      </tr>
                    ))
                  ) : !stats?.topClients?.length ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">Sin datos aún</td></tr>
                  ) : (
                    stats.topClients.map((c) => (
                      <tr key={c.clientId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(c.clientName)}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{c.clientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-sm text-gray-500">{fmt(c.totalPurchases)}</td>
                        <td className="px-5 py-3 text-right font-mono text-sm text-gray-800">{fmtMoney(c.totalSpent)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  </>
);
}