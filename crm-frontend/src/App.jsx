import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const PAGES = {
  dashboard: Dashboard,
  clients: Clients,
  products: Products,
  sales: Sales,
  history: History,
};

const PATH_TO_PAGE = {
  "": "dashboard",
  dashboard: "dashboard",
  clients: "clients",
  products: "products",
  sales: "sales",
  history: "history",
};

function getPageFromPath(pathname) {
  const path = pathname.replace(/^\//, "").split("/")[0];
  return PATH_TO_PAGE[path] ?? null;
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => getPageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setCurrentPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleNavigate = (page) => {
    window.history.pushState(null, "", `/${page}`);
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const PageComponent = currentPage && PAGES[currentPage] ? PAGES[currentPage] : NotFound;
  return <PageComponent currentPage={currentPage} onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
