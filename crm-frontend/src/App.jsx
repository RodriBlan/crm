import { useEffect, useState, useSyncExternalStore } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";
import AccessRequests from "./pages/AccessRequests";
import NotFound from "./pages/NotFound";
import Icon from "./components/Icon";

const PAGES = {
  dashboard: Dashboard,
  clients: Clients,
  products: Products,
  sales: Sales,
  history: History,
  users: AccessRequests,
};

const PATH_TO_PAGE = {
  "": "welcome",
  login: "login",
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

function subscribeToPath(onChange) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const getPath = () => window.location.pathname;

function navigate(path, replace = false) {
  window.history[replace ? "replaceState" : "pushState"](null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
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
          <Icon name="lock" size={21} />
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
  const pathname = useSyncExternalStore(subscribeToPath, getPath);
  const currentPage = getPageFromPath(pathname);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      if (["", "login"].includes(getPathSegment(window.location.pathname))) {
        setPreviewMode(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onAuthRequired = () => setShowAuthRequired(true);
    window.addEventListener("auth-required", onAuthRequired);
    return () => window.removeEventListener("auth-required", onAuthRequired);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentPage === "login") {
      navigate("/dashboard", true);
    }
  }, [isAuthenticated, currentPage]);

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const goToLogin = () => {
    setPreviewMode(false);
    setShowAuthRequired(false);
    navigate("/login");
  };

  const startPreview = () => {
    setPreviewMode(true);
    setShowAuthRequired(false);
    navigate("/dashboard");
    window.requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  };

  if (currentPage === "welcome") {
    return <Welcome onLogin={goToLogin} />;
  }

  if (!isAuthenticated && !previewMode) {
    return <Login onViewDemo={startPreview} />;
  }

  const PageComponent = currentPage === "login" && isAuthenticated
    ? Dashboard : PAGES[currentPage] ?? NotFound;

  return (
    <>
      {!isAuthenticated && previewMode && <PreviewBanner onLogin={goToLogin} />}
      <PageComponent currentPage={currentPage ?? "dashboard"} onNavigate={handleNavigate} />
      {!isAuthenticated && previewMode && showAuthRequired && (
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
