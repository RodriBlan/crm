import WorldMap from "../components/WorldMap";
import Icon from "../components/Icon";
import "./Welcome.css";

const supportEmail = "rodrigoblanco1000@gmail.com";

export default function Welcome({ onLogin }) {
  return (
    <div className="welcome">
      <header className="welcome__header">
        <span className="welcome__wordmark">YourClients<span>.</span></span>
        <span className="welcome__private"><Icon name="lock" size={14} /> Plataforma privada</span>
      </header>

      <main className="welcome__main">
        <section className="welcome__intro" aria-labelledby="welcome-title">
          <p className="welcome__eyebrow">GESTI&Oacute;N COMERCIAL</p>
          <h1 id="welcome-title">YourClients</h1>
          <p className="welcome__description">
            Clientes, productos y ventas.<br />
            Tu negocio, en un mismo lugar.
          </p>
          <button className="welcome__enter icon-inverse" type="button" onClick={onLogin}>
            Ingresar <Icon name="arrow-right" size={19} />
          </button>
          <p className="welcome__access">Acceso exclusivo para usuarios autorizados.</p>
        </section>
        <div className="welcome__visual"><WorldMap /></div>
      </main>

      <footer className="welcome__footer">
        <div className="welcome__identity">
          <h2>Un espacio para tu gesti&oacute;n diaria.</h2>
          <p>YourClients CRM es un sistema interno de gesti&oacute;n comercial para administrar clientes, productos, ventas e historial.</p>
          <p>No solicitamos datos bancarios, c&oacute;digos de terceros ni pagos online.</p>
        </div>
        <div className="welcome__contact">
          <span>Contacto de soporte</span>
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          <nav aria-label="Informaci&oacute;n del sitio">
            <a href="/privacy.html">Privacidad</a>
            <a href="/security.html">Seguridad</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
