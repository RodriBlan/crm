import { useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiJson, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, Button, Drawer, Metric, PageHeader, SkeletonRows, Pagination, ErrorBanner, Modal, FormField } from "../components/ui";
import Icon from "../components/Icon";
import { queryKeys } from "../lib/queryKeys";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({ name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "", source: client?.source ?? "", notes: client?.notes ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!form.name || !form.phone) { setError("Nombre y teléfono son obligatorios."); return; }
    setLoading(true); setError(null);
    try {
      const method = client ? "PUT" : "POST";
      const res = await apiFetch(client ? `/clients/${client.id}` : "/clients", { method, body: JSON.stringify(form) });
      if (!res?.ok) { setError(await readErrorMessage(res)); return; }
      onSave(await res.json(), !!client);
    } catch { setError("Error al guardar."); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={client ? "Editar Cliente" : "Nuevo Cliente"} onClose={onClose}
      footer={<>
        <button style={S.btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={S.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading && <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
          {client ? "Guardar" : "Crear Cliente"}
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
        {[
          { label: "Nombre *", name: "name", type: "text", placeholder: "Juan Pérez" },
          { label: "Teléfono *", name: "phone", type: "text", placeholder: "1134567890" },
          { label: "Email", name: "email", type: "email", placeholder: "juan@email.com" },
          { label: "Fuente", name: "source", type: "text", placeholder: "Instagram, Referido..." },
        ].map((f) => (
          <FormField key={f.name} label={f.label}>
            <input type={f.type} value={form[f.name]} onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))} placeholder={f.placeholder} style={S.input} />
          </FormField>
        ))}
        <FormField label="Observaciones">
          <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Ej: cliente VIP, prefiere WhatsApp..." rows={3} style={{ ...S.input, resize: "none" }} />
        </FormField>
      </div>
    </Modal>
  );
}

function DetailPanel({ client, onClose, onEdit }) {
  if (!client) return null;
  return (
    <Drawer
      title={client.name}
      subtitle={client.active ? "Cliente activo" : "Cliente inactivo"}
      onClose={onClose}
      footer={<Button icon="ti-edit" onClick={() => onEdit(client)}>Editar cliente</Button>}
    >
      <div className="client-identity">
        <Avatar name={client.name} size={46} fontSize={15} />
        <div>
          <strong>{client.name}</strong>
          <span className={client.active ? "is-active" : ""}>{client.active ? "Activo" : "Inactivo"}</span>
        </div>
      </div>

      <section className="detail-section">
        <div className="detail-section-heading"><span>Contacto</span></div>
        <dl className="detail-list">
          {[
            { icon: "ti-phone", label: "Teléfono", value: client.phone },
            { icon: "ti-mail", label: "Email", value: client.email },
            { icon: "ti-user-plus", label: "Fuente", value: client.source },
            { icon: "ti-calendar", label: "Registrado", value: client.registrationDate },
          ].map((item) => (
            <div key={item.label}>
              <Icon name={item.icon} size={16} />
              <dt>{item.label}</dt>
              <dd>{item.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="detail-section">
        <div className="detail-section-heading"><span>Observaciones</span></div>
        {client.notes ? <div className="detail-note"><p>{client.notes}</p></div> : (
          <div className="detail-empty"><Icon name="notes" size={23} /><span>Sin observaciones</span></div>
        )}
      </section>
    </Drawer>
  );
}

export default function Clients({ currentPage, onNavigate }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedValue(search.trim());
  const clientsQuery = useQuery({
    queryKey: queryKeys.clients.page(page, PAGE_SIZE, debouncedSearch),
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({
        page: String(page - 1),
        size: String(PAGE_SIZE),
        search: debouncedSearch,
      });
      return apiJson(`/clients/page?${params}`, { signal });
    },
    placeholderData: keepPreviousData,
  });
  const summaryQuery = useQuery({
    queryKey: queryKeys.clients.summary,
    queryFn: ({ signal }) => apiJson("/clients/summary", { signal }),
  });
  const clients = clientsQuery.data?.content ?? [];
  const summary = summaryQuery.data ?? { total: 0, active: 0, inactive: 0 };
  const totalElements = clientsQuery.data?.totalElements ?? 0;
  const totalPages = Math.max(1, clientsQuery.data?.totalPages ?? 1);
  const loading = clientsQuery.isPending;
  const summaryLoading = summaryQuery.isPending;
  const error = clientsQuery.error;

  function refreshClientData() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ]);
  }

  function handleSave(saved, isEdit) {
    if (detail?.id === saved.id) setDetail(saved);
    setModal(null);
    refreshClientData();
    if (!isEdit && page !== 1) setPage(1);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await apiJson(`/clients/${id}`, { method: "DELETE" });
      if (detail?.id === id) setDetail(null);
      await refreshClientData();
      if (clients.length === 1 && page > 1) setPage((current) => current - 1);
    } catch (err) { alert(err.message); }
  }

  async function handleToggleStatus(id, active) {
    try {
      const updated = await apiJson(`/clients/${id}/status?active=${active}`, { method: "PATCH" });
      if (detail?.id === id) setDetail(updated);
      await refreshClientData();
    } catch (err) { alert(err.message); }
  }

  const kpis = [
    { label: "Total", value: summary.total, icon: "ti-users", bg: "#E8EFFF", color: "#172033" },
    { label: "Activos", value: summary.active, icon: "ti-user-check", bg: "#E1F5EE", color: "#0F6E56" },
    { label: "Inactivos", value: summary.inactive, icon: "ti-user-off", bg: "#F4F6F9", color: "#64748B" },
    { label: "% Activos", value: summary.total ? Math.round((summary.active / summary.total) * 100) + "%" : "—", icon: "ti-chart-pie", bg: "#FAEEDA", color: "#854F0B" },
  ];

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate} searchPlaceholder="Buscar cliente..." searchValue={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
      <div className="page-stack">
        <PageHeader eyebrow="Relaciones" title="Clientes" description="Contactos, estado comercial y contexto de cada cuenta." actions={<Button icon="ti-user-plus" onClick={() => setModal("create")}>Nuevo cliente</Button>} meta={loading ? "Cargando" : `${totalElements} registros`} />

        <div className="page-metric-strip">
          {kpis.map((k) => (
            <Metric key={k.label} label={k.label} value={summaryLoading ? "-" : k.value} icon={k.icon} tone={k.label === "Inactivos" ? "neutral" : k.label === "% Activos" ? "warm" : "blue"} />
          ))}
        </div>

        {error && <ErrorBanner message={error.message} onRetry={clientsQuery.refetch} />}

        <div className="ui-data-panel">
          <div className="table-scroll">
            <table className="ui-table">
              <thead>
                <tr>
                  {["Cliente", "Teléfono", "Email", "Fuente", "Notas", "Estado", ""].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: h === "" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRows cols={7} rows={6} /> :
                  clients.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#64748B", padding: "40px" }}>
                      {search ? "Sin resultados." : "No hay clientes aún."}
                    </td></tr>
                  ) : clients.map((client) => (
                    <tr key={client.id} style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => setDetail(client)}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <Avatar name={client.name} size={28} fontSize={10} />
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#172033" }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px", color: "#64748B" }}>{client.phone ?? "—"}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#64748B" }}>{client.email ?? "—"}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#64748B" }}>{client.source ?? "—"}</td>
                      <td style={{ ...S.td, maxWidth: "160px" }}>
                        {client.notes
                          ? <span style={{ fontSize: "12px", color: "#64748B", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={client.notes}>{client.notes}</span>
                          : <span style={{ fontSize: "12px", color: "#E8EFFF" }}>—</span>}
                      </td>
                      <td style={S.td}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: client.active ? "#E1F5EE" : "#F4F6F9", color: client.active ? "#0F6E56" : "#64748B" }}>
                          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: client.active ? "#1D9E75" : "#D5DCE6", display: "inline-block" }} />
                          {client.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", opacity: 0, transition: "opacity 0.15s" }}>
                          {[
                            { icon: client.active ? "ti-user-off" : "ti-user-check", action: () => handleToggleStatus(client.id, !client.active), title: client.active ? "Desactivar" : "Activar" },
                            { icon: "ti-edit", action: () => setModal(client), title: "Editar" },
                            { icon: "ti-trash", action: () => handleDelete(client.id), title: "Eliminar" },
                          ].map((btn) => (
                            <button key={btn.icon} onClick={btn.action} title={btn.title}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px 5px", borderRadius: "6px", display: "flex" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#F4F6F9"; e.currentTarget.style.color = "#172033"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748B"; }}>
                              <Icon name={btn.icon} size={16} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span style={{ fontSize: "12px", color: "#64748B" }}>{loading ? "Cargando..." : `${totalElements} clientes`}</span>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {detail && <DetailPanel client={detail} onClose={() => setDetail(null)} onEdit={(c) => { setDetail(null); setModal(c); }} />}
      {modal && <ClientModal client={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
