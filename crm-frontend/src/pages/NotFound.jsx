import Layout from "../components/Layout";

export default function NotFound({ currentPage, onNavigate }) {
  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div style={{ padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontSize: "96px", fontWeight: 700, color: "#172033" }}>404</div>
        <div style={{ fontSize: "24px", fontWeight: 600, marginTop: "16px", color: "#2A3A5A" }}>
          Página no encontrada
        </div>
        <div style={{ fontSize: "16px", color: "#5B6B8A", marginTop: "12px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          La ruta que estás buscando no existe o ya no está disponible.
        </div>
        <button
          onClick={() => onNavigate("dashboard")}
          style={{
            marginTop: "30px",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            background: "#172033",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Volver al inicio
        </button>
      </div>
    </Layout>
  );
}
