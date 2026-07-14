import { Routes, Route } from "react-router-dom";

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage from "./AdminDashboardPage";
import AccountManagementPage from "./accounts/AccountListPage";
import AccountDetailPage from "./accounts/AccountDetailPage";
import KanjiManagementPage from "./kanji/KanjiManagementPage";
import KanjiCreatePage from "./kanji/KanjiCreatePage";
import KanjiEditPage from "./kanji/KanjiEditPage";
import VocabularyManagementPage from "./vocabulary/VocabularyManagementPage";
import VocabularyCreatePage from "./vocabulary/VocabularyCreatePage";
import VocabularyEditPage from "./vocabulary/VocabularyEditPage";
import LearningPathConfigPage from "./learning-path/LearningPathConfigPage";
import ReportManagementPage from "./report/ReportManagementPage";
import AdminSettingPage from "./setting/AdminSettingPage";
import AdminAccountPage from "./account_admin/AdminAccountPage";

export default function AdminPage() {
  return (
    <Routes>
      {/* Dashboard tổng quan */}
      <Route path="/" element={<AdminDashboardPage />} />

      {/* Giữ URL /students để không phá bookmark cũ; nội dung đã quản lý mọi loại tài khoản. */}
      <Route path="students" element={<AccountManagementPage />} />
      <Route path="students/:id" element={<AccountDetailPage />} />

      {/* Quản lý Kanji */}
      <Route path="kanji" element={<KanjiManagementPage />} />
      <Route path="kanji/create" element={<KanjiCreatePage />} />
      <Route path="kanji/:id/edit" element={<KanjiEditPage />} />

      {/* Quản lý Từ vựng */}
      <Route path="vocabulary" element={<VocabularyManagementPage />} />
      <Route path="vocabulary/create" element={<VocabularyCreatePage />} />
      <Route path="vocabulary/:id/edit" element={<VocabularyEditPage />} />

      {/* Cấu hình lộ trình */}
      <Route path="learning-paths" element={<LearningPathConfigPage />} />

      {/* Báo cáo */}
      <Route path="reports" element={<ReportManagementPage />} />

      {/* Cài đặt hệ thống */}
      <Route path="settings" element={<AdminSettingPage />} />

      {/* Tài khoản admin */}
      <Route path="account" element={<AdminAccountPage />} />
    </Routes>
  );
}
