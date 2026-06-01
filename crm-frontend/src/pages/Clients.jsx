import { useState, useEffect } from "react";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Avatar, getInitials, SkeletonRows, Pagination, ErrorBanner, Modal, FormField } from "../components/ui";

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
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(27,58,107,0.3)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", width: "320px", height: "100%", boxShadow: "-4px 0 30px rgba(27,58,107,0.12)", display: "flex", flexDirection: "column", zIndex: 10 }}>
        <div style={{ background: "#1B3A6B", padding: "22px 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "6px", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px 8px", display: "flex" }}>
              <i className="ti ti-x" style={{ fontSize: "16px" }} aria-hidden="true" />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", color: "#fff", flexShrink: 0 }}>
              {getInitials(client.name)}
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "500", color: "#fff" }}>{client.name}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", marginTop: "4px", background: client.active ? "rgba(29,158,117,0.2)" : "rgba(255,255,255,0.1)", color: client.active ? "#4edea3" : "rgba(255,255,255,0.5)" }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: client.active ? "#4edea3" : "rgba(255,255,255,0.4)", display: "inline-block" }} />
                {client.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Contacto</div>
              {[
                { icon: "ti-phone", label: "Teléfono", value: client.phone },
                { icon: "ti-mail", label: "Email", value: client.email },
                { icon: "ti-user-plus", label: "Fuente", value: client.source },
                { icon: "ti-calendar", label: "Registrado", value: client.registrationDate },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: "0.5px solid rgba(27,58,107,0.06)" }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: "15px", color: "#6B89B8", marginTop: "1px", flexShrink: 0 }} aria-hidden="true" />
                  <div>
                    <div style={{ fontSize: "10px", color: "#6B89B8", marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", color: "#1B3A6B", fontWeight: "500" }}>{item.value ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Observaciones</div>
              {client.notes ? (
                <div style={{ background: "#FAEEDA", border: "0.5px solid rgba(239,159,39,0.3)", borderRadius: "8px", padding: "12px 14px" }}>
                  <p style={{ fontSize: "13px", color: "#1B3A6B", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>{client.notes}</p>
                </div>
              ) : (
                <div style={{ background: "#F0F4FA", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
                  <i className="ti ti-notes" style={{ fontSize: "26px", color: "#B5CDE8", display: "block", marginBottom: "6px" }} aria-hidden="true" />
                  <span style={{ fontSize: "12px", color: "#6B89B8" }}>Sin observaciones</span>
                </div>
              )}
            </div>

            <button style={{ ...S.btnPrimary, justifyContent: "center" }} onClick={() => onEdit(client)}>
              <i className="ti ti-edit" style={{ fontSize: "14px" }} aria-hidden="true" /> Editar cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Clients({ currentPage, onNavigate }) {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  async function fetchClients() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/clients");
      if (!res?.ok) throw new Error("Error al cargar clientes.");
      setClients(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? clients.filter((c) => c.name?.toLowerCase().includes(q)) : clients);
    setPage(1);
  }, [search, clients]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = clients.filter((c) => c.active).length;

  function handleSave(saved, isEdit) {
    setClients((prev) => isEdit ? prev.map((c) => c.id === saved.id ? saved : c) : [...prev, saved]);
    if (detail?.id === saved.id) setDetail(saved);
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await apiFetch(`/clients/${id}`, { method: "DELETE" });
      setClients((prev) => prev.filter((c) => c.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (err) { alert(err.message); }
  }

  async function handleToggleStatus(id, active) {
    try {
      const res = await apiFetch(`/clients/${id}/status?active=${active}`, { method: "PATCH" });
      if (!res?.ok) return;
      const updated = await res.json();
      setClients((prev) => prev.map((c) => c.id === id ? updated : c));
      if (detail?.id === id) setDetail(updated);
    } catch (err) { alert(err.message); }
  }

  const kpis = [
    { label: "Total", value: clients.length, icon: "ti-users", bg: "#DCE8F8", color: "#1B3A6B" },
    { label: "Activos", value: activeCount, icon: "ti-user-check", bg: "#E1F5EE", color: "#0F6E56" },
    { label: "Inactivos", value: clients.length - activeCount, icon: "ti-user-off", bg: "#F0F4FA", color: "#6B89B8" },
    { label: "% Activos", value: clients.length ? Math.round((activeCount / clients.length) * 100) + "%" : "—", icon: "ti-chart-pie", bg: "#FAEEDA", color: "#854F0B" },
  ];

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}
      searchPlaceholder="Buscar cliente..." searchValue={search} onSearch={setSearch}
      headerRight={
        <button style={S.btnPrimary} onClick={() => setModal("create")}>
          <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> Nuevo Cliente
        </button>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#1B3A6B", margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: "13px", color: "#6B89B8", marginTop: "4px" }}>Gestioná tu base de clientes</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {kpis.map((k) => (
            <div key={k.label} style={{ ...S.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`ti ${k.icon}`} style={{ fontSize: "16px", color: k.color }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "500" }}>{k.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "500", color: "#1B3A6B", marginTop: "2px" }}>{loading ? "—" : k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchClients} />}

        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Cliente", "Teléfono", "Email", "Fuente", "Notas", "Estado", ""].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: h === "" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRows cols={7} rows={6} /> :
                  paginated.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#6B89B8", padding: "40px" }}>
                      {search ? "Sin resultados." : "No hay clientes aún."}
                    </td></tr>
                  ) : paginated.map((client) => (
                    <tr key={client.id} style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => setDetail(client)}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <Avatar name={client.name} size={28} fontSize={10} />
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#1B3A6B" }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px", color: "#6B89B8" }}>{client.phone ?? "—"}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8" }}>{client.email ?? "—"}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8" }}>{client.source ?? "—"}</td>
                      <td style={{ ...S.td, maxWidth: "160px" }}>
                        {client.notes
                          ? <span style={{ fontSize: "12px", color: "#6B89B8", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={client.notes}>{client.notes}</span>
                          : <span style={{ fontSize: "12px", color: "#DCE8F8" }}>—</span>}
                      </td>
                      <td style={S.td}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: client.active ? "#E1F5EE" : "#F0F4FA", color: client.active ? "#0F6E56" : "#6B89B8" }}>
                          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: client.active ? "#1D9E75" : "#B5CDE8", display: "inline-block" }} />
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
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#6B89B8", padding: "4px 5px", borderRadius: "6px", display: "flex" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#F0F4FA"; e.currentTarget.style.color = "#1B3A6B"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6B89B8"; }}>
                              <i className={`ti ${btn.icon}`} style={{ fontSize: "15px" }} aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(27,58,107,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#6B89B8" }}>{loading ? "Cargando..." : `${filtered.length} clientes`}</span>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {detail && <DetailPanel client={detail} onClose={() => setDetail(null)} onEdit={(c) => { setDetail(null); setModal(c); }} />}
      {modal && <ClientModal client={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
