import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import ConfirmModal from '../../../components/common/ConfirmModal';
import AddAccountModal from '../../../components/admin/AddAccountModal';
import ChangeRoleModal from '../../../components/admin/ChangeRoleModal';
import {
  EyeIcon,
  PlusIcon,
  LockIcon,
  UnlockIcon,
  PencilIcon,
} from '../../../components/common/AppIcons';
import {
  getAccounts,
  createAccount,
  lockAccount,
  unlockAccount,
  changeAccountRole,
} from '../../../services/admin/adminAccountManagementService';

const PAGE_LIMIT = 10;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN').format(date);
};

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalItems: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusAccount, setStatusAccount] = useState(null);
  const [roleAccount, setRoleAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Mọi tìm kiếm, bộ lọc và phân trang đều đi qua service. Page không tự đọc
    // adminMockData nên cùng một UI dùng được cho cả USE_FAKE_ADMIN true/false.
    let isActive = true;

    const loadAccounts = async () => {
      setIsLoading(true);
      try {
        const data = await getAccounts({
          page,
          limit: PAGE_LIMIT,
          keyword: searchQuery,
          role: 'ALL',
          status: statusFilter,
          level: 'ALL',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        if (!isActive) return;
        setAccounts(data.items);
        setPagination(data.pagination);
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError.message || 'Không thể tải danh sách tài khoản');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadAccounts();
    return () => {
      isActive = false;
    };
  }, [page, refreshKey, searchQuery, statusFilter]);

  const reloadAccounts = () => {
    // Tăng refreshKey giúp tải lại đúng bộ lọc/trang hiện tại sau mutation.
    setRefreshKey((current) => current + 1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleToggleStatus = async () => {
    if (!statusAccount) return;

    try {
      if (statusAccount.status === 'ACTIVE') {
        await lockAccount(statusAccount.id, {
          reason: 'Khóa từ trang quản lý tài khoản',
        });
      } else {
        await unlockAccount(statusAccount.id, {
          reason: 'Mở khóa từ trang quản lý tài khoản',
        });
      }
      setStatusAccount(null);
      reloadAccounts();
      toast.success(
        statusAccount.status === 'ACTIVE'
          ? 'Đã khóa tài khoản.'
          : 'Đã mở khóa tài khoản.',
      );
    } catch (actionError) {
      toast.error(
        actionError.message || 'Không thể cập nhật trạng thái tài khoản',
      );
    }
  };

  const handleAddAccount = async (formData) => {
    // AddAccountModal đang dùng tên field phục vụ form; chuyển sang đúng contract
    // createAccount tại boundary của page để modal không phụ thuộc backend.
    await createAccount({
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      status: formData.status.toUpperCase(),
      temporaryPassword: formData.tempPassword,
      mustChangePassword: formData.mustChangePassword,
      currentLevel:
        formData.role === 'USER' ? formData.currentLevel : null,
      note: formData.note,
    });
    setIsAddModalOpen(false);
    setPage(1);
    reloadAccounts();
    toast.success('Tạo tài khoản thành công.');
  };

  const handleRoleChange = async (role, reason) => {
    if (!roleAccount) return;

    try {
      await changeAccountRole(roleAccount.id, { role, reason });
      setRoleAccount(null);
      reloadAccounts();
      toast.success('Đã cập nhật vai trò tài khoản.');
    } catch (actionError) {
      toast.error(actionError.message || 'Không thể đổi vai trò tài khoản');
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Họ tên',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--admin-color-on-surface-variant)',
            }}
          >
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (value) => (
        <span className="admin-badge admin-badge--info">{value}</span>
      ),
    },
    {
      key: 'currentLevel',
      label: 'Cấp độ',
      render: (value) => value || '—',
    },
    {
      key: 'learningProgress',
      label: 'Tiến độ',
      render: (value) =>
        value ? `${value.completionRate || 0}%` : 'Không áp dụng',
    },
    {
      key: 'createdAt',
      label: 'Ngày đăng ký',
      render: formatDate,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => <StatusBadge status={value.toLowerCase()} />,
    },
    {
      key: 'id',
      label: 'Hành động',
      render: (id, row) => (
        <span style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="admin-action-btn"
            title="Chi tiết"
            onClick={() => navigate(`/admin/students/${id}`)}
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Đổi vai trò"
            onClick={() => setRoleAccount(row)}
          >
            <PencilIcon size={16} />
          </button>
          <button
            type="button"
            className={`admin-action-btn ${row.status === 'ACTIVE' ? 'admin-action-btn--delete' : ''
              }`}
            title={row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
            onClick={() => setStatusAccount(row)}
          >
            {row.status === 'ACTIVE' ? (
              <LockIcon size={16} />
            ) : (
              <UnlockIcon size={16} />
            )}
          </button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Quản lý Tài khoản</h1>
          <p>
            Danh sách toàn bộ tài khoản người dùng trên hệ thống (
            {pagination.totalItems} tài khoản)
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon size={16} /> Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Tìm theo tên, email..."
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            marginBottom: 16,
            color: 'var(--admin-color-error)',
            background: 'var(--admin-color-error-container)',
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--admin-color-on-surface-variant)',
          }}
        >
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <AdminTable
            title="Danh sách tài khoản"
            columns={columns}
            rows={accounts}
            emptyText="Không tìm thấy tài khoản nào phù hợp."
          />

          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Trang trước
              </button>
              <span>
                Trang {pagination.page}/{pagination.totalPages}
              </span>
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(statusAccount)}
        onClose={() => setStatusAccount(null)}
        onConfirm={handleToggleStatus}
        title={
          statusAccount?.status === 'ACTIVE'
            ? 'Khóa tài khoản'
            : 'Mở khóa tài khoản'
        }
        message={
          statusAccount?.status === 'ACTIVE' ? (
            <>
              Bạn có chắc chắn muốn khóa tài khoản của <strong>{statusAccount?.fullName}</strong>?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn mở khóa tài khoản của <strong>{statusAccount?.fullName}</strong>?
            </>
          )
        }
        confirmText={
          statusAccount?.status === 'ACTIVE' ? 'Khóa ngay' : 'Mở khóa'
        }
        isDanger={statusAccount?.status === 'ACTIVE'}
      />

      <ChangeRoleModal
        isOpen={Boolean(roleAccount)}
        onClose={() => setRoleAccount(null)}
        onConfirm={handleRoleChange}
        currentRole={roleAccount?.role}
        accountName={roleAccount?.fullName}
      />

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAccount}
      />
    </div>
  );
}
