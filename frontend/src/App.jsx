import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * App — root component.
 *
 * Route structure:
 *   /login              → LoginPage (public)
 *   /auth/callback      → AuthCallbackPage (public — handles OAuth edge cases)
 *
 *   (PrivateRoute)       → requires authentication
 *     /                 → HomePage
 *
 *   (RoleRoute ADMIN)   → requires ADMIN role
 *     /admin            → AdminPage (placeholder — not yet built)
 *
 *   *                   → NotFoundPage
 */
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* ── Protected routes (auth required) ──────────────────────── */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/"
              element={
                <AppLayout>
                  <HomePage />
                </AppLayout>
              }
            />
          </Route>

          {/* ── Admin-only routes ─────────────────────────────────────── */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} redirectTo="/" />}>
            <Route
              path="/admin"
              element={
                <AppLayout>
                  {/* AdminPage placeholder — to be implemented later */}
                  <div className="placeholder-page">
                    <h1>Admin Dashboard</h1>
                    <p>Admin features coming soon.</p>
                  </div>
                </AppLayout>
              }
            />
          </Route>

          {/* ── Catch-all ─────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
