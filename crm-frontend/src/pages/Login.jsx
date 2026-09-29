import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const inputFields = [
  {
    label: "Usuario",
    name: "username",
    type: "text",
    placeholder: "Tu usuario",
    icon: "ti-user",
    autoComplete: "username",
  },
  {
    label: "Contraseña",
    name: "password",
    type: "password",
    placeholder: "Tu contraseña",
    icon: "ti-lock",
    autoComplete: "current-password",
  },
];

const supportEmail = "rodrigoblanco1000@gmail.com";
const MIN_PASSWORD_LENGTH = 6;

export default function Login({ onViewDemo }) {
  const { login, requestAccess } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);
  const [mode, setMode] = useState("login");

  useEffect(() => {
    if (!loading) {
      setSlowServer(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSlowServer(true), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.username || !form.password) {
      setError("Completá usuario y contraseña.");
      return;
    }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setLoading(true);
    setSlowServer(false);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "request") {
        await requestAccess(form.username, form.password);
        setSuccess("Solicitud enviada. Un administrador debe aprobar la cuenta antes del primer ingreso.");
        setForm({ username: "", password: "" });
        return;
      }
      await login(form.username, form.password);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((current) => current === "login" ? "request" : "login");
    setError(null);
    setSuccess(null);
  }

  return (
    <main className="login-screen-professional">
      <section className="login-auth-shell" aria-label="Acceso a YourClients">
        <aside className="login-context">
          <div className="login-context-brand">
            <span aria-hidden="true"><i className="ti ti-address-book" /></span>
            <div>
              <strong>YourClients</strong>
              <small>Gestión comercial</small>
            </div>
          </div>

          <div className="login-context-copy">
            <p>Espacio de trabajo privado</p>
            <h1>Tu operación comercial, en orden.</h1>
            <span>Accedé a la información de clientes, productos y ventas desde un único lugar.</span>
          </div>

          <div className="login-context-status">
            <span><i className="ti ti-lock" aria-hidden="true" /> Acceso autorizado</span>
            <span><i className="ti ti-database" aria-hidden="true" /> Datos protegidos</span>
          </div>
        </aside>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <span>{mode === "login" ? "Acceso" : "Alta de usuario"}</span>
            <h2>{mode === "login" ? "Iniciar sesión" : "Solicitar acceso"}</h2>
            <p>
              {mode === "login"
                ? "Ingresá con las credenciales autorizadas para este espacio."
                : "La cuenta quedará pendiente hasta que un administrador la apruebe."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error" role="alert">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login-success" role="status">
                <i className="ti ti-circle-check" aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}

            {slowServer && !error && (
              <div className="login-status" role="status">
                <i className="ti ti-clock-hour-4" aria-hidden="true" />
                <span>El servidor se está iniciando. El acceso puede tardar unos segundos.</span>
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
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    minLength={field.name === "password" ? MIN_PASSWORD_LENGTH : undefined}
                  />
                </div>
              </label>
            ))}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading && <span className="login-spinner" aria-hidden="true" />}
              {loading
                ? (slowServer ? "Conectando..." : (mode === "login" ? "Ingresando..." : "Enviando..."))
                : (mode === "login" ? "Ingresar" : "Enviar solicitud")}
            </button>

            <button className="login-mode-switch" type="button" onClick={toggleMode}>
              {mode === "login" ? "Solicitar una cuenta" : "Volver al inicio de sesión"}
            </button>

            {mode === "login" && (
              <button className="login-demo-link" type="button" onClick={onViewDemo}>
                <i className="ti ti-eye" aria-hidden="true" />
                Explorar demostración
              </button>
            )}
          </form>

          <footer className="login-form-footer">
            <span>Soporte: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></span>
            <nav aria-label="Información legal y de seguridad">
              <a href="/privacy.html">Privacidad</a>
              <a href="/security.html">Seguridad</a>
            </nav>
          </footer>
        </div>
      </section>
    </main>
  );
}
