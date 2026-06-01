import { useState, useEffect } from "react";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, SkeletonRows, Pagination, ErrorBanner, Modal, FormField } from "../components/ui";

function CategoryManager({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCategories() {
    const res = await apiFetch("/categories");
    if (res?.ok) setCategories(await res.json());
  }
  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate() {
    if (!newName.trim()) { setError("Ingresá un nombre."); return; }
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/categories", { method: "POST", body: JSON.stringify({ description: newName.trim() }) });
      if (!res?.ok) { setError(await readErrorMessage(res)); return; }
      setNewName(""); fetchCategories();
    } catch { setError("Error al crear."); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    const res = await apiFetch(`/categories/${id}`, { method: "DELETE" });
    if (res?.ok) fetchCategories();
  }

  return (
    <Modal title="Gestionar Categorías" onClose={onClose}
      footer={<button style={S.btnSecondary} onClick={onClose}>Cerrar</button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nueva categoría..."
            onKeyDown={(e) => e.key === "Enter" && handleCreate()} style={{ ...S.input, flex: 1 }} />
          <button style={S.btnPrimary} onClick={handleCreate} disabled={loading}>
            {loading ? <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> : <i className="ti ti-plus" style={{ fontSize: "14px" }} />}
            Crear
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
          {categories.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6B89B8", textAlign: "center", padding: "20px 0" }}>No hay categorías aún.</p>
          ) : categories.map((cat) => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F0F4FA", border: "0.5px solid rgba(27,58,107,0.08)", borderRadius: "8px", padding: "9px 12px" }}>
              <span style={{ fontSize: "13px", color: "#1B3A6B", fontWeight: "500" }}>{cat.description}</span>
              <button onClick={() => handleDelete(cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B89B8", display: "flex", padding: "2px" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#A32D2D"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6B89B8"}>
                <i className="ti ti-trash" style={{ fontSize: "15px" }} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ name: product?.name ?? "", description: product?.description ?? "", price: product?.price ?? "", stock: product?.stock ?? "", descuento: product?.descuento ?? 0, categoryId: product?.categoryId ?? "" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/categories").then((r) => r?.json()).then((d) => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.price) { setError("Nombre y precio son obligatorios."); return; }
    setLoading(true); setError(null);
    try {
      const method = product ? "PATCH" : "POST";
      const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, descuento: parseFloat(form.descuento) || 0, categoryId: form.categoryId ? parseInt(form.categoryId) : null };
      const res = await apiFetch(product ? `/products/${product.id}` : "/products", { method, body: JSON.stringify(body) });
      if (!res?.ok) { setError(await readErrorMessage(res)); return; }
      onSave(await res.json(), !!product);
    } catch { setError("Error al guardar."); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={product ? "Editar Producto" : "Nuevo Producto"} onClose={onClose}
      footer={<>
        <button style={S.btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={S.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading && <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
          {product ? "Guardar" : "Crear Producto"}
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && <div style={{ background: "#FCEBEB", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
        <FormField label="Nombre *"><input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del producto" style={S.input} /></FormField>
        <FormField label="Descripción"><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Descripción..." style={{ ...S.input, resize: "none" }} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="Precio ($) *"><input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0.00" step="0.01" style={S.input} /></FormField>
          <FormField label="Stock"><input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} placeholder="0" style={S.input} /></FormField>
          <FormField label="Descuento (%)"><input type="number" value={form.descuento} onChange={(e) => setForm((p) => ({ ...p, descuento: e.target.value }))} placeholder="0" min="0" max="100" style={S.input} /></FormField>
          <FormField label="Categoría">
            <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} style={{ ...S.input, appearance: "none" }}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.description}</option>)}
            </select>
          </FormField>
        </div>
      </div>
    </Modal>
  );
}

export default function Products({ currentPage, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  async function fetchProducts() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/products");
      if (!res?.ok) throw new Error("Error al cargar productos.");
      const data = await res.json();
      setProducts(data.content ?? data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? products.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : products);
    setPage(1);
  }, [search, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(saved, isEdit) {
    setProducts((prev) => isEdit ? prev.map((p) => p.id === saved.id ? saved : p) : [...prev, saved]);
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err.message); }
  }

  function StockIndicator({ stock }) {
    if (stock == null) return <span style={{ color: "#6B89B8", fontSize: "12px" }}>—</span>;
    const color = stock === 0 ? "#A32D2D" : stock <= 5 ? "#854F0B" : "#0F6E56";
    const bg = stock === 0 ? "#FCEBEB" : stock <= 5 ? "#FAEEDA" : "#E1F5EE";
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", background: bg, color }}>
        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color, display: "inline-block" }} />
        {stock}
      </span>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}
      searchPlaceholder="Buscar producto..." searchValue={search} onSearch={setSearch}
      headerRight={
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={S.btnSecondary} onClick={() => setShowCategories(true)}>
            <i className="ti ti-category" style={{ fontSize: "14px" }} aria-hidden="true" /> Categorías
          </button>
          <button style={S.btnPrimary} onClick={() => setModal("create")}>
            <i className="ti ti-plus" style={{ fontSize: "14px" }} aria-hidden="true" /> Nuevo Producto
          </button>
        </div>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#1B3A6B", margin: 0 }}>Productos</h1>
          <p style={{ fontSize: "13px", color: "#6B89B8", marginTop: "4px" }}>Gestioná tu catálogo, precios y stock</p>
        </div>

        {error && <ErrorBanner message={error} onRetry={fetchProducts} />}

        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nombre", "Descripción", "Categoría", "Precio", "Stock", "Descuento", ""].map((h, i) => (
                    <th key={i} style={{ ...S.th, textAlign: h === "" ? "center" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRows cols={7} rows={6} /> :
                  paginated.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#6B89B8", padding: "40px" }}>{search ? "Sin resultados." : "No hay productos aún."}</td></tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F0F4FA"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...S.td, fontWeight: "500" }}>{p.name}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8", maxWidth: "200px" }}>
                        <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.description ?? "—"}</span>
                      </td>
                      <td style={S.td}>
                        {p.categoryDescription
                          ? <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: "#DCE8F8", color: "#1B3A6B" }}>{p.categoryDescription}</span>
                          : <span style={{ color: "#B5CDE8", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px" }}>${Number(p.price).toFixed(2)}</td>
                      <td style={S.td}><StockIndicator stock={p.stock} /></td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#6B89B8" }}>{p.descuento > 0 ? `${p.descuento}%` : "—"}</td>
                      <td style={{ ...S.td, textAlign: "center" }}>
                        <div className="row-actions" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s" }}>
                          {[
                            { icon: "ti-edit", action: () => setModal(p), title: "Editar" },
                            { icon: "ti-trash", action: () => handleDelete(p.id), title: "Eliminar" },
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
            <span style={{ fontSize: "12px", color: "#6B89B8" }}>{loading ? "Cargando..." : `${filtered.length} productos`}</span>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
      {modal && <ProductModal product={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
