import { useState, useEffect } from "react";
import { apiFetch, readErrorMessage } from "../utils/apiFetch";
import Layout from "../components/Layout";

// ─── Modal Categorías ────────────────────────────────────────────────────────
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
      const res = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ description: newName.trim() }),
      });
      if (!res.ok) { setError(await readErrorMessage(res)); return; }
      setNewName("");
      fetchCategories();
    } catch { setError("Error al crear la categoría."); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      const res = await apiFetch(`/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { alert(await readErrorMessage(res)); return; }
      fetchCategories();
    } catch { alert("Error al eliminar."); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">Gestionar Categorías</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

        {/* Crear nueva */}
        <div className="flex gap-2">
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la categoría..."
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          <button onClick={handleCreate} disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#0058be] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-1">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[18px]">add</span>}
            Crear
          </button>
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay categorías aún.</p>
          ) : categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-800">{cat.description}</span>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Producto ──────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    descuento: product?.descuento ?? 0,
    categoryId: product?.categoryId ?? "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/categories").then((r) => r?.json()).then((data) => {
      if (Array.isArray(data)) setCategories(data);
    }).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.price) { setError("Nombre y precio son obligatorios."); return; }
    setLoading(true); setError(null);
    try {
      const method = product ? "PATCH" : "POST";
      const path = product ? `/products/${product.id}` : "/products";
      const body = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        descuento: parseFloat(form.descuento) || 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      const res = await apiFetch(path, { method, body: JSON.stringify(body) });
      if (!res.ok) { setError(await readErrorMessage(res)); return; }
      onSave(await res.json(), !!product);
    } catch { setError("Error al guardar el producto."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Remera Blanca"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descripción del producto..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio ($) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" step="0.01"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descuento (%)</label>
            <input type="number" name="descuento" value={form.descuento} onChange={handleChange} placeholder="0" min="0" max="100"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all">
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.description}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#0058be] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {product ? "Guardar Cambios" : "Crear Producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Products({ currentPage, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  async function fetchProducts() {
    setLoading(true); setError(null);
    try {
      const res = await apiFetch("/products");
      if (!res.ok) throw new Error("No se pudieron cargar los productos.");
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
      const res = await apiFetch(`/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { alert(err.message); }
  }

  function stockBadge(stock) {
    if (stock == null) return null;
    if (stock === 0) return <span className="flex items-center gap-1 text-red-600 font-mono text-sm"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{stock}</span>;
    if (stock <= 5) return <span className="flex items-center gap-1 text-yellow-600 font-mono text-sm"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{stock}</span>;
    return <span className="flex items-center gap-1 text-green-600 font-mono text-sm"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{stock}</span>;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={onNavigate}
      searchPlaceholder="Buscar producto..."
      searchValue={search}
      onSearch={setSearch}
      headerRight={
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">category</span>
            Categorías
          </button>
          <button onClick={() => setModal("create")}
            className="flex items-center gap-2 bg-[#0058be] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Crear Nuevo
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestioná tu catálogo, precios y stock.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
            <button onClick={fetchProducts} className="ml-auto underline">Reintentar</button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Nombre", "Descripción", "Categoría", "Precio", "Stock", "Descuento", "Acciones"].map((h) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${h === "Acciones" ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">{search ? "Sin resultados." : "No hay productos aún."}</td></tr>
                ) : (
                  paginated.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-3 px-4 font-semibold text-sm text-gray-900 whitespace-nowrap">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 max-w-[220px] truncate">{product.description ?? "—"}</td>
                      <td className="py-3 px-4">
                        {product.categoryDescription
                          ? <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold">{product.categoryDescription}</span>
                          : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-gray-800 whitespace-nowrap">${Number(product.price).toFixed(2)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{stockBadge(product.stock)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 text-center">{product.descuento > 0 ? `${product.descuento}%` : "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal(product)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {loading ? "Cargando..." : `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} productos`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${p === page ? "bg-[#0058be] text-white" : "text-gray-500 hover:bg-gray-200"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCategoryManager && <CategoryManager onClose={() => setShowCategoryManager(false)} />}
      {modal && <ProductModal product={modal === "create" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </Layout>
  );
}
