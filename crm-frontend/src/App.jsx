import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";
import AccessRequests from "./pages/AccessRequests";
import NotFound from "./pages/NotFound";

const PAGES = {
  dashboard: Dashboard,
  clients: Clients,
  products: Products,
  sales: Sales,
  history: History,
  users: AccessRequests,
};

const PATH_TO_PAGE = {
  "": "dashboard",
  dashboard: "dashboard",
  clients: "clients",
  products: "products",
  sales: "sales",
  history: "history",
  users: "users",
};

function getPathSegment(pathname) {
  return pathname.replace(/^\//, "").split("/")[0];
}

function getPageFromPath(pathname) {
  return PATH_TO_PAGE[getPathSegment(pathname)] ?? null;
}

function PreviewBanner({ onLogin }) {
  return (
    <div className="preview-banner" role="status">
      <div>
        <strong>Vista previa</strong>
        <span>Estas viendo datos de ejemplo. Para crear, editar o eliminar, inicia sesion.</span>
      </div>
      <button onClick={onLogin}>Iniciar sesion</button>
    </div>
  );
}

function AuthRequiredDialog({ onClose, onLogin }) {
  return (
    <div className="auth-required-backdrop" role="presentation">
      <div className="auth-required-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
        <div className="auth-required-icon">
          <i className="ti ti-lock" aria-hidden="true" />
        </div>
        <h2 id="auth-required-title">Inicia sesion para continuar</h2>
        <p>La vista previa permite recorrer el CRM, pero las acciones reales requieren una cuenta autorizada.</p>
        <div>
          <button className="auth-required-secondary" onClick={onClose}>Seguir viendo demo</button>
          <button className="auth-required-primary" onClick={onLogin}>Iniciar sesion</button>
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => getPageFromPath(window.location.pathname));
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  useEffect(() => {
    const onPopState = () => setCurrentPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onAuthRequired = () => setShowAuthRequired(true);
    window.addEventListener("auth-required", onAuthRequired);
    return () => window.removeEventListener("auth-required", onAuthRequired);
  }, []);

  useEffect(() => {
    if (isAuthenticated && getPathSegment(window.location.pathname) === "login") {
      window.history.replaceState(null, "", "/dashboard");
      setCurrentPage("dashboard");
    }
  }, [isAuthenticated]);

  const handleNavigate = (page) => {
    window.history.pushState(null, "", `/${page}`);
    setCurrentPage(page);
  };

  const goToLogin = () => {
    setShowAuthRequired(false);
    window.history.pushState(null, "", "/login");
    setCurrentPage(null);
  };

  if (!isAuthenticated && getPathSegment(window.location.pathname) === "login") {
    return <Login />;
  }

  const PageComponent = currentPage && PAGES[currentPage] ? PAGES[currentPage] : NotFound;

  return (
    <>
      {!isAuthenticated && <PreviewBanner onLogin={goToLogin} />}
      <PageComponent currentPage={currentPage ?? "dashboard"} onNavigate={handleNavigate} />
      {!isAuthenticated && showAuthRequired && (
        <AuthRequiredDialog onClose={() => setShowAuthRequired(false)} onLogin={goToLogin} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
