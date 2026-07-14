import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import AdminTable from '../../components/admin/AdminTable';
import {
  UsersIcon,
  DatabaseIcon,
  AlertIcon,
  ChartIcon,
  EyeIcon,
  PencilIcon,
} from '../../components/common/AppIcons';
import { getDashboard } from '../../services/admin/adminDashboardService';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN').format(date);
};

const accountColumns = [
  { key: 'fullName', label: 'Họ tên' },
  { key: 'email', label: 'Email' },
  {
    key: 'currentLevel',
    label: 'Cấp độ',
    render: (value) => (
      <span className="admin-badge admin-badge--info">{value || '—'}</span>
    ),
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (value) => (
      <span
        className={`admin-badge admin-badge--${
          value === 'ACTIVE' ? 'active' : 'inactive'
        }`}
      >
        {value === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Ngày tham gia',
    render: formatDate,
  },
  {
    key: 'id',
    label: 'Hành động',
    render: (id) => (
      <Link
        className="admin-action-btn"
        title="Xem chi tiết"
        to={`/admin/students/${id}`}
      >
        <EyeIcon size={14} />
      </Link>
    ),
  },
];

const kanjiColumns = [
  {
    key: 'character',
    label: 'Kanji',
    render: (value) => (
      <span
        style={{
          fontFamily: 'Noto Sans JP, serif',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    ),
  },
  {
    key: 'onyomi',
    label: 'Cách đọc',
    render: (value, row) =>
      [value, row.kunyomi].filter(Boolean).join(' · ') || '—',
  },
  { key: 'meaning', label: 'Nghĩa' },
  {
    key: 'jlptLevel',
    label: 'JLPT',
    render: (value) => (
      <span className="admin-badge admin-badge--info">{value}</span>
    ),
  },
  {
    key: 'updatedAt',
    label: 'Cập nhật',
    render: formatDate,
  },
  {
    key: 'id',
    label: 'Hành động',
    render: (id) => (
      <Link
        className="admin-action-btn"
        title="Chỉnh sửa"
        to={`/admin/kanji/${id}/edit`}
      >
        <PencilIcon size={14} />
      </Link>
    ),
  },
];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Guard này ngăn request cũ cập nhật state nếu admin chuyển route trước khi
    // service trả kết quả. Page chỉ biết contract UI, toàn bộ fake/API thật nằm ở service.
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        if (!isActive) return;
        setDashboard(data);
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError.message || 'Không thể tải dữ liệu Dashboard');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div
        role="status"
        style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--admin-color-on-surface-variant)',
        }}
      >
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div
        role="alert"
        style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--admin-color-error)',
        }}
      >
        {error || 'Không tải được dữ liệu tổng quan'}
      </div>
    );
  }

  const { stats, recentAccounts, recentKanji } = dashboard;

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Bảng điều khiển Quản trị</h1>
          <p>Tổng quan hoạt động hệ thống JELA</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon={<UsersIcon size={24} />}
          iconColor="teal"
          label="Tổng số tài khoản"
          value={stats.totalAccounts}
          trend={`${stats.totalStudents} học viên · ${stats.totalTutors} gia sư`}
        />
        <StatCard
          icon={<ChartIcon size={24} />}
          iconColor="blue"
          label="Lượt truy cập hôm nay"
          value={stats.todayVisits}
          trend={`${stats.newAccountsToday} tài khoản mới hôm nay`}
        />
        <StatCard
          icon={<DatabaseIcon size={24} />}
          iconColor="amber"
          label="Tổng số Kanji"
          value={stats.totalKanji}
          trend="Kanji đang quản lý"
        />
        <StatCard
          icon={<AlertIcon size={24} />}
          iconColor="red"
          label="Báo cáo chờ xử lý"
          value={stats.pendingReports}
          trend="Cần quản trị viên kiểm tra"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <AdminTable
          title="Tài khoản mới đăng ký"
          columns={accountColumns}
          rows={recentAccounts}
        />
        <AdminTable
          title="Kanji vừa cập nhật"
          columns={kanjiColumns}
          rows={recentKanji}
        />
      </div>
    </div>
  );
}
