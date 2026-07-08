import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const inputFields = [
  {
    label: "Usuario",
    name: "username",
    type: "text",
    placeholder: "tu usuario",
    icon: "ti-user",
    autoComplete: "username",
  },
  {
    label: "Contrasena",
    name: "password",
    type: "password",
    placeholder: "tu contrasena",
    icon: "ti-lock",
    autoComplete: "current-password",
  },
];

const supportEmail = "rodrigoblanco1000@gmail.com";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlowServer(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSlowServer(true), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Completa usuario y contrasena.");
      return;
    }

    setLoading(true);
    setSlowServer(false);
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
    <main className="login-screen login-screen-minimal">
      <section className="login-card login-card-clay" aria-label="Inicio de sesion">
        <div className="login-minimal-brand">
          <div className="login-brand-mark">YC</div>
          <div>
            <p>YourClients</p>
            <h1>CRM</h1>
          </div>
        </div>

        <div className="login-card-heading">
          <h2>Bienvenido</h2>
          <span>Gestion comercial para clientes, productos y ventas.</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {slowServer && !error && (
            <div className="login-status" role="status">
              <i className="ti ti-clock-hour-4" aria-hidden="true" />
              <span>El servidor puede estar despertando. Esto puede tardar unos segundos.</span>
            </div>
          )}

          {inputFields.map((field) => (
            <label className="login-field" key={field.name}>
              <span>{field.label}</span>
              <div>
                <i className={`ti ${field.icon}`} aria-hidden="true" />
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                />
              </div>
            </label>
          ))}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading && <span className="login-spinner" aria-hidden="true" />}
            {loading ? (slowServer ? "Esperando..." : "Ingresando...") : "Ingresar"}
          </button>
        </form>

        <div className="login-minimal-meta">
          <span>Vista privada. No solicita pagos ni datos bancarios.</span>
          <nav aria-label="Informacion legal y de seguridad">
            <a href="/privacy.html">Privacidad</a>
            <a href="/security.html">Seguridad</a>
            <a href={`mailto:${supportEmail}`}>Contacto</a>
          </nav>
        </div>
      </section>
    </main>
  );
}
