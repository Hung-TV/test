import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import RoleBadge from '../../../components/admin/RoleBadge';
import ChangeRoleModal from '../../../components/admin/ChangeRoleModal';
import LockAccountModal from '../../../components/admin/LockAccountModal';
import StatCard from '../../../components/admin/StatCard';
import {
  ArrowLeftIcon,
  LockIcon,
  UnlockIcon,
  BookOpenIcon,
  DatabaseIcon,
  EyeIcon,
  PencilIcon,
} from '../../../components/common/AppIcons';
import {
  getAccountById,
  getAccountAdminLogs,
  changeAccountRole,
  lockAccount,
  unlockAccount,
} from '../../../services/admin/adminAccountManagementService';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
};

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    // Tải thông tin và audit log song song vì hai dữ liệu độc lập. isActive
    // tránh response cũ ghi đè khi id thay đổi hoặc component đã unmount.
    let isActive = true;

    const loadAccount = async () => {
      setIsLoading(true);
      try {
        const [accountData, logsData] = await Promise.all([
          getAccountById(id),
          getAccountAdminLogs(id),
        ]);
        if (!isActive) return;
        setAccount(accountData);
        setAdminLogs(logsData);
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(
          loadError.message ||
          'Không tìm thấy tài khoản hoặc đã xảy ra lỗi.',
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadAccount();
    return () => {
      isActive = false;
    };
  }, [id, refreshKey]);

  const reloadAccount = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleRoleChange = async (role, reason) => {
    try {
      await changeAccountRole(account.id, { role, reason });
      setIsRoleModalOpen(false);
      reloadAccount();
      toast.success('Đã cập nhật vai trò tài khoản.');
    } catch (actionError) {
      toast.error(actionError.message || 'Không thể thay đổi phân quyền');
    }
  };

  const handleToggleStatus = async (reason) => {
    try {
      if (account.status === 'ACTIVE') {
        await lockAccount(account.id, { reason });
      } else {
        await unlockAccount(account.id, { reason });
      }
      setIsLockModalOpen(false);
      reloadAccount();
      toast.success(
        account.status === 'ACTIVE'
          ? 'Đã khóa tài khoản.'
          : 'Đã mở khóa tài khoản.',
      );
    } catch (actionError) {
      toast.error(actionError.message || 'Không thể cập nhật trạng thái');
    }
  };

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
        Đang tải dữ liệu tài khoản...
      </div>
    );
  }

  if (error || !account) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <h2 style={{ color: 'var(--admin-color-error)' }}>
          {error || 'Không tìm thấy tài khoản'}
        </h2>
        <button
          type="button"
          className="admin-btn admin-btn--outline"
          onClick={() => navigate('/admin/students')}
          style={{ marginTop: 16 }}
        >
          <ArrowLeftIcon size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const progress = account.learningProgress;
  const history = account.recentActivities || [];

  const historyColumns = [
    { key: 'date', label: 'Ngày' },
    { key: 'activity', label: 'Hoạt động' },
    {
      key: 'score',
      label: 'Điểm số',
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
  ];

  const adminLogColumns = [
    {
      key: 'createdAt',
      label: 'Thời gian',
      render: (value) => (
        <span
          style={{
            fontSize: 13,
            color: 'var(--admin-color-on-surface-variant)',
          }}
        >
          {formatDateTime(value)}
        </span>
      ),
    },
    { key: 'adminName', label: 'Admin thao tác' },
    {
      key: 'actionType',
      label: 'Hành động',
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: 'oldValue',
      label: 'Giá trị cũ',
      render: (value) => (
        <span
          style={{
            textDecoration: value ? 'line-through' : 'none',
            color: 'var(--admin-color-error)',
          }}
        >
          {value || '—'}
        </span>
      ),
    },
    {
      key: 'newValue',
      label: 'Giá trị mới',
      render: (value) => (
        <span style={{ color: 'var(--admin-color-primary)' }}>
          {value || '—'}
        </span>
      ),
    },
    { key: 'reason', label: 'Lý do' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <button
            type="button"
            className="admin-btn admin-btn--outline"
            style={{ marginBottom: 16, padding: '6px 12px' }}
            onClick={() => navigate('/admin/students')}
          >
            <ArrowLeftIcon size={16} /> Quay lại
          </button>
          <h1>Chi tiết Tài khoản</h1>
          <p>
            Xem thông tin, phân quyền và hoạt động của{' '}
            <strong>{account.fullName}</strong>
          </p>
        </div>
      </div>

      <div className="admin-detail-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="admin-info-card">
            <h3
              style={{
                margin: '0 0 20px',
                color: 'var(--admin-color-navy)',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {account.avatarUrl && (
                <img
                  src={account.avatarUrl}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              )}
              Thông tin cá nhân
            </h3>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Họ tên</span>
              <span
                className="admin-info-row__value"
                style={{ fontWeight: 600 }}
              >
                {account.fullName}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Email</span>
              <span className="admin-info-row__value">{account.email}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Cấp độ hiện tại</span>
              <span className="admin-info-row__value">
                {account.currentLevel ? (
                  <span className="admin-badge admin-badge--info">
                    {account.currentLevel}
                  </span>
                ) : (
                  'Không áp dụng'
                )}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Ngày tạo tài khoản</span>
              <span className="admin-info-row__value">
                {formatDateTime(account.createdAt)}
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Đăng nhập gần nhất</span>
              <span className="admin-info-row__value">
                {formatDateTime(account.lastLoginAt)}
              </span>
            </div>
          </div>

          <div className="admin-info-card">
            <h3
              style={{
                margin: '0 0 16px',
                color: 'var(--admin-color-navy)',
                fontSize: 18,
              }}
            >
              Trạng thái & Phân quyền
            </h3>

            <div className="admin-info-row">
              <span className="admin-info-row__label">Phân quyền hiện tại</span>
              <span className="admin-info-row__value">
                <RoleBadge role={account.role} />
              </span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Trạng thái tài khoản</span>
              <span className="admin-info-row__value">
                <StatusBadge status={account.status.toLowerCase()} />
              </span>
            </div>

            {account.status === 'LOCKED' && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--admin-color-error-container)',
                  borderRadius: 8,
                  marginTop: 12,
                  fontSize: 14,
                }}
              >
                <strong>Lý do khóa:</strong> {account.lockReason || '—'}
                <br />
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--admin-color-on-surface-variant)',
                  }}
                >
                  Khóa lúc: {formatDateTime(account.lockedAt)}
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 24,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={() => setIsRoleModalOpen(true)}
              >
                <PencilIcon size={16} /> Đổi phân quyền
              </button>
              <button
                type="button"
                className={`admin-btn ${account.status === 'ACTIVE'
                    ? 'admin-btn--danger'
                    : 'admin-btn--primary'
                  }`}
                onClick={() => setIsLockModalOpen(true)}
              >
                {account.status === 'ACTIVE' ? (
                  <>
                    <LockIcon size={16} /> Khóa tài khoản
                  </>
                ) : (
                  <>
                    <UnlockIcon size={16} /> Mở khóa tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {account.role === 'USER' && (
            <div>
              <h3
                style={{
                  margin: '0 0 16px',
                  color: 'var(--admin-color-navy)',
                  fontSize: 16,
                }}
              >
                Tổng quan học tập (Chỉ đọc)
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                <StatCard
                  icon={<DatabaseIcon size={24} />}
                  iconColor="teal"
                  label="Kanji đã học"
                  value={progress?.kanji || 0}
                />
                <StatCard
                  icon={<BookOpenIcon size={24} />}
                  iconColor="blue"
                  label="Từ vựng đã học"
                  value={progress?.vocabulary || 0}
                />
                <StatCard
                  icon={<EyeIcon size={24} />}
                  iconColor="amber"
                  label="Quiz đã làm"
                  value={progress?.quizzes || 0}
                />
                <StatCard
                  icon={<DatabaseIcon size={24} />}
                  iconColor="purple"
                  label="Điểm trung bình"
                  value={progress?.averageScore || 0}
                />
              </div>
            </div>
          )}

          {account.role === 'USER' && (
            <AdminTable
              title="Lịch sử học tập gần đây (Chỉ đọc)"
              columns={historyColumns}
              rows={history}
              emptyText="Chưa có hoạt động học tập nào."
            />
          )}

          <AdminTable
            title="Lịch sử quản trị (Admin Logs)"
            columns={adminLogColumns}
            rows={adminLogs}
            emptyText="Chưa có lịch sử thao tác từ Admin."
          />
        </div>
      </div>

      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onConfirm={handleRoleChange}
        currentRole={account.role}
        accountName={account.fullName}
      />

      <LockAccountModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        onConfirm={handleToggleStatus}
        accountName={account.fullName}
        isLocking={account.status === 'ACTIVE'}
      />
    </div>
  );
}
