import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const inputFields = [
  {
    label: "Usuario",
    name: "username",
    type: "text",
    placeholder: "Nombre de usuario asignado",
    icon: "ti-user",
    autoComplete: "username",
  },
  {
    label: "Contrasena",
    name: "password",
    type: "password",
    placeholder: "Contrasena de acceso",
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
    <main className="login-screen">
      <section className="login-intro" aria-label="Informacion del sistema">
        <div className="login-brand">
          <div className="login-brand-mark">PV</div>
          <div>
            <p className="login-brand-label">YourClients</p>
            <h1>YourClients CRM</h1>
          </div>
        </div>

        <div className="login-copy">
          <p className="login-eyebrow">Plataforma privada</p>
          <h2>Sistema interno de gestion comercial para clientes y ventas.</h2>
          <p>
            Acceso exclusivo para usuarios autorizados. YourClients CRM se usa para administrar
            clientes, productos, ventas e historial comercial interno.
          </p>
        </div>

        <div className="login-trust-list" aria-label="Caracteristicas de seguridad">
          <div>
            <i className="ti ti-shield-check" aria-hidden="true" />
            <span>Acceso autenticado</span>
          </div>
          <div>
            <i className="ti ti-database" aria-hidden="true" />
            <span>Datos comerciales internos</span>
          </div>
          <div>
            <i className="ti ti-lock-check" aria-hidden="true" />
            <span>Uso autorizado solamente</span>
          </div>
        </div>

        <div className="login-public-info" aria-label="Informacion publica del sitio">
          <span>Contacto de soporte: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></span>
          <span>YourClients CRM no solicita datos bancarios, codigos de terceros ni pagos online.</span>
        </div>
      </section>

      <section className="login-panel" aria-label="Inicio de sesion">
        <div className="login-card">
          <div className="login-card-heading">
            <p>Inicio de sesion</p>
            <h2>Ingresar al panel</h2>
            <span>Usa las credenciales creadas por el administrador del sistema.</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error" role="alert">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{error}</span>
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
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-note">
            <i className="ti ti-info-circle" aria-hidden="true" />
            <p>Si no tenes acceso, solicita un usuario al responsable interno o escribi al contacto de soporte.</p>
          </div>

          <nav className="login-public-links" aria-label="Informacion legal y de seguridad">
            <a href="/privacy.html">Privacidad</a>
            <a href="/security.html">Seguridad</a>
            <a href={`mailto:${supportEmail}`}>Contacto</a>
          </nav>
        </div>
      </section>
    </main>
  );
}
