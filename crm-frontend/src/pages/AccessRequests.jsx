import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { S, ErrorBanner } from "../components/ui";
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
        <div className="page-heading">
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#172033", margin: 0 }}>Usuarios</h1>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>Aproba o rechaza solicitudes de acceso a YourClients.</p>
        </div>

        {!isAdmin && (
          <ErrorBanner message="Solo un administrador puede gestionar usuarios." />
        )}

        {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

        <div style={S.card}>
          <div style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(23,32,51,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "650", color: "#172033" }}>Solicitudes pendientes</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>{requests.length} pendientes</div>
            </div>
            <button style={S.btnSecondary} onClick={fetchRequests} disabled={loading}>
              <i className="ti ti-refresh" aria-hidden="true" /> Actualizar
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "28px", color: "#64748B", fontSize: "13px" }}>Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "34px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
              No hay solicitudes pendientes.
            </div>
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
        </div>
      </div>
    </Layout>
  );
}
