import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { PencilIcon, TrashIcon, PlusIcon, LockIcon, UnlockIcon } from '../../../components/common/AppIcons';
import {
  deleteVocabulary,
  getVocabularyList,
  updateVocabularyStatus,
} from '../../../services/admin/adminVocabularyService';

const PAGE_LIMIT = 10;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN').format(date);
};

const getStatusPresentation = (status) => {
  if (status === 'ACTIVE') return { status: 'active', label: 'Hoạt động' };
  if (status === 'DELETED') return { status: 'locked', label: 'Đã xóa' };
  return { status: 'inactive', label: 'Đang ẩn' };
};

export default function VocabularyManagementPage() {
  const navigate = useNavigate();
  
  const [vocabularies, setVocabularies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_LIMIT, totalItems: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [jlptFilter, setJlptFilter] = useState('ALL');
  const [posFilter, setPosFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [statusItem, setStatusItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Service chịu trách nhiệm normalize, filter, sort và phân trang cho
        // cả mock lẫn API thật; page chỉ truyền tiêu chí hiển thị.
        const data = await getVocabularyList({
          page,
          limit: PAGE_LIMIT,
          keyword: searchQuery,
          level: jlptFilter,
          partOfSpeech: posFilter,
          status: statusFilter,
        });
        if (!isActive) return;
        setVocabularies(data.items);
        setPagination(data.pagination);
        setError('');
      } catch (err) {
        if (!isActive) return;
        setError(err.message || 'Không thể tải danh sách từ vựng');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadData();
    return () => { isActive = false; };
  }, [page, refreshKey, searchQuery, jlptFilter, posFilter, statusFilter]);

  const reloadData = () => setRefreshKey((curr) => curr + 1);

  // Handlers
  const handleToggleStatus = async () => {
    if (!statusItem) return;
    try {
      const newStatus = statusItem.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
      await updateVocabularyStatus(statusItem.id, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công!');
      setStatusItem(null);
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteVocabulary(deleteItem.id);
      toast.success('Xóa từ vựng thành công!');
      setDeleteItem(null);
      // Nếu vừa xóa item cuối trang, quay về trang trước thay vì để bảng rỗng.
      if (vocabularies.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        reloadData();
      }
    } catch (err) {
      toast.error(err.message || 'Không thể xóa từ vựng');
    }
  };

  const columns = [
    { 
      key: 'word', 
      label: 'Từ vựng', 
      render: (v, row) => (
        <div>
          <div style={{ fontFamily: 'Noto Sans JP, serif', fontSize: 18, fontWeight: 700, color: 'var(--admin-color-navy)' }}>{v}</div>
          <div style={{ fontSize: 13, color: 'var(--admin-color-on-surface-variant)' }}>{row.kana}</div>
        </div>
      ) 
    },
    { key: 'meaning', label: 'Nghĩa', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    // { key: 'partOfSpeech', label: 'Loại từ' },
    { key: 'jlptLevel', label: 'JLPT', render: (v) => <span className="admin-badge admin-badge--info">{v}</span> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => {
        const presentation = getStatusPresentation(value);
        return (
          <StatusBadge
            status={presentation.status}
            customLabel={presentation.label}
          />
        );
      },
    },
    { key: 'updatedAt', label: 'Cập nhật', render: formatDate },
    { 
      key: 'id', 
      label: 'Hành động', 
      render: (id, row) => (
        <span style={{ display: 'flex', gap: 4 }}>
          <button 
            type="button"
            className="admin-action-btn" 
            title="Chỉnh sửa"
            onClick={() => navigate(`/admin/vocabulary/${id}/edit`)}
          >
            <PencilIcon size={16} />
          </button>
          
          {row.status !== 'DELETED' && (
            <button 
              type="button"
              className={`admin-action-btn ${row.status === 'ACTIVE' ? 'admin-action-btn--delete' : ''}`}
              title={row.status === 'ACTIVE' ? 'Ẩn từ vựng' : 'Hiện từ vựng'}
              onClick={() => setStatusItem(row)}
            >
              {row.status === 'ACTIVE' ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
            </button>
          )}

          {row.status !== 'DELETED' && (
            <button 
              type="button"
              className="admin-action-btn admin-action-btn--delete" 
              title="Xóa"
              onClick={() => setDeleteItem(row)}
            >
              <TrashIcon size={16} />
            </button>
          )}
        </span>
      )
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Quản lý Từ vựng</h1>
          <p>Danh sách toàn bộ từ vựng trên hệ thống ({pagination.totalItems} từ vựng)</p>
        </div>
        <div className="admin-page-header__actions">
          <button 
            className="admin-btn admin-btn--primary"
            onClick={() => navigate('/admin/vocabulary/create')}
          >
            <PlusIcon size={16} /> Thêm từ vựng
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <input 
          type="text" 
          className="admin-form-input" 
          placeholder="Tìm từ vựng, kana, nghĩa..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          style={{ minWidth: 200 }}
        />
        
        <select 
          className="admin-form-input" 
          value={jlptFilter} 
          onChange={(e) => { setJlptFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">Tất cả cấp độ JLPT</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>

        {/* <select 
          className="admin-form-input" 
          value={posFilter} 
          onChange={(e) => { setPosFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">Tất cả loại từ</option>
          <option value="Danh từ">Danh từ</option>
          <option value="Động từ">Động từ</option>
          <option value="Tính từ đuôi i">Tính từ đuôi i</option>
          <option value="Tính từ đuôi na">Tính từ đuôi na</option>
          <option value="Trạng từ">Trạng từ</option>
          <option value="Liên từ">Liên từ</option>
          <option value="Khác">Khác</option>
        </select> */}

        <select 
          className="admin-form-input" 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="HIDDEN">Đang ẩn</option>
          <option value="DELETED">Đã xóa</option>
        </select>
      </div>

      {error && (
        <div role="alert" style={{ padding: 12, marginBottom: 16, color: 'var(--admin-color-error)', background: 'var(--admin-color-error-container)', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div role="status" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-on-surface-variant)' }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <AdminTable
            title="Danh sách từ vựng"
            columns={columns}
            rows={vocabularies}
            emptyText="Không tìm thấy từ vựng nào phù hợp."
          />

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button 
                type="button" 
                className="admin-btn admin-btn--outline" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Trang trước
              </button>
              <span>Trang {pagination.page}/{pagination.totalPages}</span>
              <button 
                type="button" 
                className="admin-btn admin-btn--outline" 
                disabled={page >= pagination.totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Toggle Status */}
      <ConfirmModal
        isOpen={Boolean(statusItem)}
        onClose={() => setStatusItem(null)}
        onConfirm={handleToggleStatus}
        title={statusItem?.status === 'ACTIVE' ? 'Ẩn từ vựng' : 'Hiện từ vựng'}
        message={
          statusItem?.status === 'ACTIVE' 
            ? `Bạn có chắc chắn muốn ẩn từ vựng "${statusItem?.word}"? Từ này sẽ không còn hiển thị với học viên.`
            : `Bạn có chắc chắn muốn hiển thị lại từ vựng "${statusItem?.word}"?`
        }
        confirmText={statusItem?.status === 'ACTIVE' ? 'Ẩn từ vựng' : 'Hiện từ vựng'}
        isDanger={statusItem?.status === 'ACTIVE'}
      />

      {/* Modal Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Xóa từ vựng"
        message={`Bạn có chắc chắn muốn xóa từ vựng "${deleteItem?.word}" không? Hành động này không thể hoàn tác (Soft Delete).`}
        confirmText="Xóa từ vựng"
        isDanger={true}
      />

    </div>
  );
}
