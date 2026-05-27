import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Clients from "./pages/Clients";

function AppRouter() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Clients />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}