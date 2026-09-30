import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button, DataPanel, EmptyState, ErrorBanner, PageHeader } from "../components/ui";
import { apiJson } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import { queryKeys } from "../lib/queryKeys";

export default function AccessRequests({ currentPage, onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: queryKeys.accessRequests,
    queryFn: ({ signal }) => apiJson("/auth/access-requests", { signal }),
    enabled: isAdmin,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, action }) => apiJson(`/auth/access-requests/${id}/${action}`, { method: "PATCH" }),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(queryKeys.accessRequests, (current = []) =>
        current.filter((request) => request.id !== variables.id));
    },
  });
  const requests = requestsQuery.data ?? [];
  const loading = requestsQuery.isPending && isAdmin;
  const error = requestsQuery.error || updateMutation.error;
  const savingId = updateMutation.isPending ? updateMutation.variables?.id : null;

  function updateRequest(id, action) {
    updateMutation.mutate({ id, action });
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} showSearch={false}>
      <div className="page-stack">
        <PageHeader eyebrow="Administración" title="Usuarios" description="Revisá y resolvé solicitudes de acceso al espacio de trabajo." meta={`${requests.length} pendientes`} actions={<Button variant="secondary" icon="ti-refresh" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching}>Actualizar</Button>} />

        {!isAdmin && (
          <ErrorBanner message="Solo un administrador puede gestionar usuarios." />
        )}

        {error && <ErrorBanner message={error.message} onRetry={() => requestsQuery.refetch()} />}

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
