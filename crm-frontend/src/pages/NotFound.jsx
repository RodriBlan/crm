import Layout from "../components/Layout";
import { Button, EmptyState, PageHeader } from "../components/ui";

export default function NotFound({ currentPage, onNavigate }) {
  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} showSearch={false}>
      <div className="page-stack">
        <PageHeader eyebrow="Navegación" title="Página no encontrada" description="La dirección solicitada no corresponde a una sección disponible." />
        <div className="not-found-panel">
          <EmptyState
            icon="ti-route-off"
            title="No encontramos esa página"
            description="Podés volver al resumen y continuar trabajando desde allí."
            action={<Button icon="ti-arrow-left" onClick={() => onNavigate("dashboard")}>Volver al resumen</Button>}
          />
        </div>
      </div>
    </Layout>
  );
}
