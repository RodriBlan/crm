import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

const MIN_PASSWORD_LENGTH = 6;
const supportEmail = "rodrigoblanco1000@gmail.com";

export default function Login({ onViewDemo }) {
  const { login, requestAccess } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slowServer, setSlowServer] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!loading) return undefined;
    const timeoutId = window.setTimeout(() => setSlowServer(true), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Completá tu usuario y contraseña.");
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
        await requestAccess(form.username.trim(), form.password);
        setSuccess("Solicitud enviada. Un administrador debe aprobar tu cuenta antes de que puedas ingresar.");
        setForm({ username: "", password: "" });
      } else {
        await login(form.username.trim(), form.password);
      }
    } catch (requestError) {
      setError(requestError.message || "No pudimos completar la solicitud. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }

  return (
    <main className="printvar-login">
      <section className="printvar-login__panel" aria-labelledby="printvar-login-title">
        <header className="printvar-login__header">
          <span className="printvar-login__brand">YourClients</span>
          <div className="printvar-login__heading">
            <h1 id="printvar-login-title">{mode === "login" ? "Ingresá a tu cuenta" : "Solicitá acceso"}</h1>
            <p>{mode === "login" ? "Accedé al sistema de gestión de PrintVar." : "Creá tu usuario. Un administrador aprobará tu solicitud."}</p>
          </div>
        </header>

        <form className="printvar-login__form" onSubmit={handleSubmit} noValidate>
          {error && <div className="printvar-login__notice printvar-login__notice--error" role="alert"><Icon name="alert-circle" size={18} /><span>{error}</span></div>}
          {success && <div className="printvar-login__notice printvar-login__notice--success" role="status"><Icon name="circle-check" size={18} /><span>{success}</span></div>}
          {slowServer && !error && <div className="printvar-login__notice printvar-login__notice--info" role="status"><Icon name="clock" size={18} /><span>El servidor se está iniciando. Puede tardar unos segundos.</span></div>}

          <div className="printvar-login__field">
            <label htmlFor="printvar-username">Usuario</label>
            <input
              id="printvar-username"
              name="username"
              type="text"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Tu usuario"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          <div className="printvar-login__field">
            <label htmlFor="printvar-password">Contraseña</label>
            <div className="printvar-login__password-wrap">
              <input
                id="printvar-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Tu contraseña"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
              <button type="button" className="printvar-login__reveal" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
                <Icon name="eye" size={19} />
              </button>
            </div>
            {mode === "request" && <small>Al menos {MIN_PASSWORD_LENGTH} caracteres.</small>}
          </div>

          <button className="printvar-login__submit" type="submit" disabled={loading}>
            {loading && <span className="printvar-login__spinner" aria-hidden="true" />}
            <span>{loading ? (slowServer ? "Conectando..." : mode === "login" ? "Ingresando..." : "Enviando...") : mode === "login" ? "Ingresar" : "Enviar solicitud"}</span>
            {!loading && <Icon name="arrow-right" size={18} />}
          </button>
        </form>

        <div className="printvar-login__actions">
          {mode === "login" ? (
            <>
              <p>¿Todavía no tenés una cuenta? <button type="button" onClick={() => switchMode("request")}>Solicitar acceso</button></p>
              <button className="printvar-login__demo" type="button" onClick={onViewDemo}><Icon name="eye" size={17} /> Ver demostración</button>
            </>
          ) : (
            <button className="printvar-login__back" type="button" onClick={() => switchMode("login")}><Icon name="arrow-left" size={17} /> Volver a iniciar sesión</button>
          )}
        </div>
      </section>

      <footer className="printvar-login__footer">
        <a href={`mailto:${supportEmail}`}>Soporte</a>
        <span aria-hidden="true">·</span>
        <a href="/privacy.html">Privacidad</a>
        <span aria-hidden="true">·</span>
        <a href="/security.html">Seguridad</a>
      </footer>
    </main>
  );
}
