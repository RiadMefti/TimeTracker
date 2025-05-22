import type { Auth } from "firebase/auth";
import { type FC } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TimeEntriesPage from "./pages/TimeEntriesPage";
import ProjectsPage from "./pages/ProjectsPage";
import NotFoundPage from "./pages/NotFoundPage";

interface AppProps {
  auth: Auth;
}

const App: FC<AppProps> = ({ auth }) => {
  // Initialize auth to set up the user in the store
  useAuth(auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          }
        />
        <Route
          path="/time-entries"
          element={
            <MainLayout>
              <TimeEntriesPage />
            </MainLayout>
          }
        />
        <Route
          path="/projects"
          element={
            <MainLayout>
              <ProjectsPage />
            </MainLayout>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
