import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// ── Layouts ──────────────────────────────────────────────────────────────────
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// ── Route Guards ─────────────────────────────────────────────────────────────
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import AdminRoute from "./guards/AdminRoute";
import DictionaryRoute from "./guards/DictionaryRoute";

// ── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmResetPasswordPage from "./pages/ConfirmResetPasswordPage";

// ── User Pages ───────────────────────────────────────────────────────────────
import DashboardPage from "./pages/DashboardPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import KanjiLearningPage from "./features/KanjiLearning/pages/KanjiLearningPage";
import MyDecksHub from "./features/MyDeck/MyDecksHub";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminPage from "./pages/admin/AdminPage";
// ── Misc ─────────────────────────────────────────────────────────────────────
import ScrollToTop from "./components/common/ScrollToTop";

// Landing page lazy-loaded để không bị CSS chèn vào app.
const LandingPage = lazy(() => import("./pages/LandingPage"));

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "962773257163-l6fdpi0tn77tbg5305obmflcjn00kuef.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>

            {/* ── PUBLIC (chưa đăng nhập) ── */}
            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ResetPasswordPage />} />
                <Route path="/reset-password" element={<ConfirmResetPasswordPage />} />
              </Route>
            </Route>

            {/* ── ADMIN (đã đăng nhập + role ADMIN) ── */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/*" element={<AdminPage />} />
              </Route>
            </Route>

            {/* Guest dùng public layout; học viên giữ Sidebar/Header của app. */}
            <Route path="/dictionary" element={<DictionaryRoute />} />

            {/* ── USER (đã đăng nhập, cả USER lẫn ADMIN đều vào được) ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/roadmap" element={<ComingSoonPage />} />
                <Route path="/kanji" element={<KanjiLearningPage />} />
                <Route path="/my-decks" element={<MyDecksHub />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* ── Landing page (public, lazy) ── */}
            <Route
              path="/landing"
              element={(
                <Suspense fallback={null}>
                  <LandingPage />
                </Suspense>
              )}
            />

            {/* ── Fallback: 404 về Home (ProtectedRoute sẽ redirect sang /login nếu cần) ── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: 'var(--color-surface-container-lowest)',
                color: 'var(--color-on-surface)',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
