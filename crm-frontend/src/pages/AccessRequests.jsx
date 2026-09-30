import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button, DataPanel, EmptyState, ErrorBanner, PageHeader } from "../components/ui";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";

export default function AccessRequests({ currentPage, onNavigate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/access-requests");
      if (!res?.ok) throw new Error(res ? await readErrorMessage(res) : "No se pudieron cargar las solicitudes.");
      setRequests(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function updateRequest(id, action) {
    setSavingId(id);
    setError(null);
    try {
      const res = await apiFetch(`/auth/access-requests/${id}/${action}`, { method: "PATCH" });
      if (!res?.ok) throw new Error(res ? await readErrorMessage(res) : "No se pudo actualizar la solicitud.");
      setRequests((current) => current.filter((request) => request.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} showSearch={false}>
      <div className="page-stack">
        <PageHeader eyebrow="Administración" title="Usuarios" description="Revisá y resolvé solicitudes de acceso al espacio de trabajo." meta={`${requests.length} pendientes`} actions={<Button variant="secondary" icon="ti-refresh" onClick={fetchRequests} disabled={loading}>Actualizar</Button>} />

        {!isAdmin && (
          <ErrorBanner message="Solo un administrador puede gestionar usuarios." />
        )}

        {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

        <DataPanel title="Solicitudes pendientes" description="Nuevas cuentas que requieren una decisión del administrador.">
          {loading ? (
            <div className="panel-loading"><span className="login-spinner" /> Cargando solicitudes</div>
          ) : requests.length === 0 ? (
            <EmptyState icon="ti-user-check" title="No hay solicitudes pendientes" description="Las nuevas solicitudes aparecerán aquí para su revisión." />
          ) : (
            <div className="access-request-list">
              {requests.map((request) => (
                <div className="access-request-row" key={request.id}>
                  <div className="access-request-user">
                    <div className="access-request-avatar">{request.username?.[0]?.toUpperCase() ?? "U"}</div>
                    <div>
                      <div className="access-request-name">{request.username}</div>
                      <div className="access-request-meta">Rol inicial: {request.role} · Estado: {request.status}</div>
                    </div>
                  </div>
                  <div className="access-request-actions">
                    <button
                      className="access-request-reject"
                      onClick={() => updateRequest(request.id, "reject")}
                      disabled={savingId === request.id}
                    >
                      Rechazar
                    </button>
                    <button
                      className="access-request-approve"
                      onClick={() => updateRequest(request.id, "approve")}
                      disabled={savingId === request.id}
                    >
                      {savingId === request.id ? "Guardando..." : "Aprobar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DataPanel>
      </div>
    </Layout>
  );
}
