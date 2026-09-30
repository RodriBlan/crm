import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "../utils/apiFetch";
import Layout from "../components/Layout";
import { S, Button, PageHeader, SkeletonRows, Pagination, ErrorBanner, Modal, FormField } from "../components/ui";
import Icon from "../components/Icon";
import { queryKeys } from "../lib/queryKeys";

function CategoryManager({ onClose }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: ({ signal }) => apiJson("/categories", { signal }),
  });
  const categories = categoriesQuery.data ?? [];
  const createCategory = useMutation({
    mutationFn: (description) => apiJson("/categories", {
      method: "POST",
      body: JSON.stringify({ description }),
    }),
    onSuccess: () => {
      setNewName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.products.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
  const deleteCategory = useMutation({
    mutationFn: (id) => apiJson(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
  const loading = createCategory.isPending;

  async function handleCreate() {
    if (!newName.trim()) { setError("Ingresá un nombre."); return; }
    setError(null);
    try {
      await createCategory.mutateAsync(newName.trim());
    } catch (requestError) { setError(requestError.message || "Error al crear."); }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Gestionar Categorías" onClose={onClose}
      footer={<button style={S.btnSecondary} onClick={onClose}>Cerrar</button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#A32D2D" }}>{error}</div>}
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nueva categoría..."
            onKeyDown={(e) => e.key === "Enter" && handleCreate()} style={{ ...S.input, flex: 1 }} />
          <button className="icon-inverse" style={S.btnPrimary} onClick={handleCreate} disabled={loading}>
            {loading ? <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> : <Icon name="plus" size={15} />}
            Crear
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
          {categories.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748B", textAlign: "center", padding: "20px 0" }}>No hay categorías aún.</p>
          ) : categories.map((cat) => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F4F6F9", border: "0.5px solid rgba(23,32,51,0.08)", borderRadius: "8px", padding: "9px 12px" }}>
              <span style={{ fontSize: "13px", color: "#172033", fontWeight: "500" }}>{cat.description}</span>
              <button onClick={() => handleDelete(cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", padding: "2px" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#A32D2D"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}>
                <Icon name="trash" size={16} />
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
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: ({ signal }) => apiJson("/categories", { signal }),
  });
  const categories = categoriesQuery.data ?? [];
  const saveProduct = useMutation({
    mutationFn: ({ body, method, path }) => apiJson(path, {
      method,
      body: JSON.stringify(body),
    }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      onSave(saved);
    },
  });
  const loading = saveProduct.isPending;

  async function handleSubmit() {
    if (!form.name || !form.price) { setError("Nombre y precio son obligatorios."); return; }
    setError(null);
    try {
      const method = product ? "PATCH" : "POST";
      const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, descuento: parseFloat(form.descuento) || 0, categoryId: form.categoryId ? parseInt(form.categoryId) : null };
      await saveProduct.mutateAsync({
        body,
        method,
        path: product ? `/products/${product.id}` : "/products",
      });
    } catch (requestError) { setError(requestError.message || "Error al guardar."); }
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
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;
  const queryClient = useQueryClient();
  const productsQuery = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: ({ signal }) => apiJson("/products", { signal }),
  });
  const products = useMemo(() => {
    const productData = productsQuery.data?.content ?? productsQuery.data;
    return Array.isArray(productData) ? productData : [];
  }, [productsQuery.data]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? products.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) : products;
  }, [search, products]);
  const deleteProduct = useMutation({
    mutationFn: (id) => apiJson(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
  const loading = productsQuery.isPending;
  const error = productsQuery.error;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave() {
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await deleteProduct.mutateAsync(id);
    } catch (err) { alert(err.message); }
  }

  function StockIndicator({ stock }) {
    if (stock == null) return <span style={{ color: "#64748B", fontSize: "12px" }}>—</span>;
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
    <Layout currentPage={currentPage} onNavigate={onNavigate} searchPlaceholder="Buscar producto..." searchValue={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
      <div className="page-stack">
        <PageHeader eyebrow="Catálogo" title="Productos" description="Precios, disponibilidad y categorías de tu oferta." meta={loading ? "Cargando" : `${products.length} registros`} actions={<><Button variant="secondary" icon="ti-category" onClick={() => setShowCategories(true)}>Categorías</Button><Button icon="ti-plus" onClick={() => setModal("create")}>Nuevo producto</Button></>} />

        {error && <ErrorBanner message={error.message} onRetry={productsQuery.refetch} />}

        <div className="ui-data-panel">
          <div className="table-scroll">
            <table className="ui-table">
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
                    <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#64748B", padding: "40px" }}>{search ? "Sin resultados." : "No hay productos aún."}</td></tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F4F6F9"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...S.td, fontWeight: "500" }}>{p.name}</td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#64748B", maxWidth: "200px" }}>
                        <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.description ?? "—"}</span>
                      </td>
                      <td style={S.td}>
                        {p.categoryDescription
                          ? <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "500", background: "#E8EFFF", color: "#172033" }}>{p.categoryDescription}</span>
                          : <span style={{ color: "#D5DCE6", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontSize: "12px" }}>${Number(p.price).toFixed(2)}</td>
                      <td style={S.td}><StockIndicator stock={p.stock} /></td>
                      <td style={{ ...S.td, fontSize: "12px", color: "#64748B" }}>{p.descuento > 0 ? `${p.descuento}%` : "—"}</td>
                      <td style={{ ...S.td, textAlign: "center" }}>
                        <div className="row-actions" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s" }}>
                          {[
                            { icon: "ti-edit", action: () => setModal(p), title: "Editar" },
                            { icon: "ti-trash", action: () => handleDelete(p.id), title: "Eliminar" },
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
            <span style={{ fontSize: "12px", color: "#64748B" }}>{loading ? "Cargando..." : `${filtered.length} productos`}</span>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>

      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
      {modal && <ProductModal product={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
