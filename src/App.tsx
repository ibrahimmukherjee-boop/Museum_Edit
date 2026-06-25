import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { MuseumErrorBoundary } from "./components/MuseumErrorBoundary";
import { isLoggedIn } from "./lib/auth";
import AtelierHubPage from "./pages/AtelierHubPage";
import AtelierRoomPage from "./pages/AtelierRoomPage";
import ConversationPage from "./pages/ConversationPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

function RequireAuth() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={isLoggedIn() ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/parlor" element={<ConversationPage />} />
        <Route path="/conversation" element={<Navigate to="/parlor" replace />} />
        <Route path="/atelier" element={<MuseumErrorBoundary label="Atelier"><AtelierHubPage /></MuseumErrorBoundary>} />
        <Route path="/atelier/:domain" element={<MuseumErrorBoundary label="Atelier workshop"><AtelierRoomPage /></MuseumErrorBoundary>} />
      </Route>
      <Route path="*" element={<Navigate to={isLoggedIn() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
