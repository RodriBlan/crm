import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";

// Fonts & icons loaded once at the root
function GlobalStyles() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; } .icon-fill { font-variation-settings: 'FILL' 1; }`}</style>
    </>
  );
}

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

  return (
    <PageComponent
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
}

export default function App() {
  return (
    <>
      <GlobalStyles />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
}
