import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { Avatar, Button, DataPanel, EmptyState, ErrorBanner, PageHeader, SkeletonRows, fmtMoney, fmtNum } from "../components/ui";
import { NewSaleModal } from "./Sales";
import Icon from "../components/Icon";
import { queryKeys } from "../lib/queryKeys";

function SummaryMetric({ icon, label, value, detail }) {
  return (
    <article className="dashboard-summary-metric">
      <div className="dashboard-summary-icon"><Icon name={icon} size={19} /></div>
      <div><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
    </article>
  );
}

export default function Dashboard({ currentPage, onNavigate }) {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: stats, isPending: loading, error, refetch } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: ({ signal }) => apiJson("/stats", { signal }),
  });

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} showSearch={false}>
      <div className="page-stack dashboard-page">
        <PageHeader
          eyebrow="Panorama comercial"
          title="Resumen"
          description="Indicadores clave y actividad reciente del negocio."
          actions={<Button icon="ti-plus" onClick={() => setShowSaleModal(true)}>Nueva venta</Button>}
        />

        {error && <ErrorBanner message={error.message} onRetry={refetch} />}

        <section className="dashboard-overview" aria-label="Indicadores principales">
          <article className="dashboard-primary-metric">
            <div className="dashboard-primary-heading">
              <div><span>Ingresos del mes</span><small>Mes actual</small></div>
              <div className="dashboard-primary-icon"><Icon name="chart-line" size={21} /></div>
            </div>
            <strong>{loading ? "-" : fmtMoney(stats?.revenueThisMonth)}</strong>
            <footer>
              <span><Icon name="receipt" size={15} /> {loading ? "-" : fmtNum(stats?.salesThisMonth)} ventas registradas</span>
              <button onClick={() => onNavigate("sales")}>Ver ventas <Icon name="arrow-right" size={15} /></button>
            </footer>
          </article>

          <div className="dashboard-secondary-metrics">
            <SummaryMetric icon="ti-wallet" label="Ingresos acumulados" value={loading ? "-" : fmtMoney(stats?.totalRevenue)} detail="Histórico total" />
            <SummaryMetric icon="ti-shopping-cart" label="Ventas acumuladas" value={loading ? "-" : fmtNum(stats?.totalSales)} detail="Todas las operaciones" />
          </div>
        </section>

        <div className="dashboard-data-grid">
          <DataPanel
            title="Productos con más movimiento"
            description="Rendimiento por unidades vendidas"
            action={<Button variant="text" icon="ti-arrow-right" onClick={() => onNavigate("products")}>Ver catálogo</Button>}
          >
            <div className="table-scroll">
              <table className="ui-table dashboard-table">
                <thead><tr><th>Producto</th><th className="align-right">Unidades</th><th className="align-right">Ingresos</th></tr></thead>
                <tbody>
                  {loading ? <SkeletonRows cols={3} rows={5} /> : !stats?.topProducts?.length ? (
                    <tr><td colSpan={3}><EmptyState compact icon="ti-package" title="Todavía no hay movimientos" description="Los productos vendidos aparecerán en este listado." /></td></tr>
                  ) : stats.topProducts.map((product, index) => (
                    <tr key={product.productId}>
                      <td><div className="table-primary-cell"><span className="table-rank">{index + 1}</span><strong>{product.productName}</strong></div></td>
                      <td className="align-right muted-cell">{fmtNum(product.totalQuantitySold)}</td>
                      <td className="align-right money-cell">{fmtMoney(product.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>

          <DataPanel
            title="Clientes con mayor actividad"
            description="Ordenados por valor acumulado"
            action={<Button variant="text" icon="ti-arrow-right" onClick={() => onNavigate("clients")}>Ver clientes</Button>}
          >
            <div className="table-scroll">
              <table className="ui-table dashboard-table">
                <thead><tr><th>Cliente</th><th className="align-right">Compras</th><th className="align-right">Total</th></tr></thead>
                <tbody>
                  {loading ? <SkeletonRows cols={3} rows={5} /> : !stats?.topClients?.length ? (
                    <tr><td colSpan={3}><EmptyState compact icon="ti-users" title="Todavía no hay actividad" description="Los clientes con compras aparecerán aquí." /></td></tr>
                  ) : stats.topClients.map((client) => (
                    <tr key={client.clientId}>
                      <td><div className="table-primary-cell"><Avatar name={client.clientName} size={28} fontSize={9} /><strong>{client.clientName}</strong></div></td>
                      <td className="align-right muted-cell">{fmtNum(client.totalPurchases)}</td>
                      <td className="align-right money-cell">{fmtMoney(client.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>
      </div>

      {showSaleModal && <NewSaleModal onClose={() => setShowSaleModal(false)} onSave={() => {
        setShowSaleModal(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      }} />}
    </Layout>
  );
}
