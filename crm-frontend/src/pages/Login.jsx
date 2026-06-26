import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Completa usuario y contrasena.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "50vh", background: "#1B3A6B", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "44px", height: "44px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "14px" }}>P</div>
          <h1 style={{ fontSize: "20px", fontWeight: "500", color: "#fff", margin: 0 }}>PrintVar CRM</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "6px" }}>Sistema privado para usuarios autorizados</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 8px 40px rgba(27,58,107,0.15)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && (
              <div style={{ background: "#FCEBEB", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#A32D2D" }}>
                <i className="ti ti-alert-circle" style={{ fontSize: "15px", flexShrink: 0 }} aria-hidden="true" />
                {error}
              </div>
            )}

            {[
              { label: "Usuario", name: "username", type: "text", placeholder: "tu usuario", icon: "ti-user", autoComplete: "username" },
              { label: "Contrasena", name: "password", type: "password", placeholder: "********", icon: "ti-lock", autoComplete: "current-password" },
            ].map((f) => (
              <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "500", color: "#6B89B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                <div style={{ position: "relative" }}>
                  <i className={`ti ${f.icon}`} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#6B89B8" }} aria-hidden="true" />
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    style={{ width: "100%", paddingLeft: "38px", paddingRight: "12px", paddingTop: "10px", paddingBottom: "10px", border: "0.5px solid rgba(27,58,107,0.15)", borderRadius: "8px", fontSize: "13px", color: "#1B3A6B", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{ background: "#1B3A6B", color: "#fff", border: "none", borderRadius: "20px", padding: "11px", fontSize: "13px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px" }}
            >
              {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
              Ingresar
            </button>
          </form>

          <p style={{ margin: "16px 0 0", fontSize: "11px", lineHeight: 1.5, color: "#6B89B8", textAlign: "center" }}>
            Acceso exclusivo para gestion interna de PrintVar. Este sitio no solicita datos bancarios ni codigos de verificacion externos.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #B5CDE8; }`}</style>
    </div>
  );
}
