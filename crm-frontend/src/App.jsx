import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";

const PAGES = {
  dashboard: Dashboard,
  clients: Clients,
  products: Products,
  sales: Sales,
  history: History,
};

function AppRouter() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (!isAuthenticated) return <Login />;

  const PageComponent = PAGES[currentPage] ?? Dashboard;
  return <PageComponent currentPage={currentPage} onNavigate={setCurrentPage} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
