import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import ConfirmModal from '../../../components/common/ConfirmModal';
import {
  EyeIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
} from '../../../components/common/AppIcons';
import {
  getKanjiList,
  updateKanjiStatus,
  deleteKanji,
} from '../../../services/admin/adminKanjiService';

const PAGE_LIMIT = 10;

export default function KanjiManagementPage() {
  const navigate = useNavigate();
  const [kanjiList, setKanjiList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalItems: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKanji, setSelectedKanji] = useState(null);

  useEffect(() => {
    // Service chịu trách nhiệm search/filter/sort/pagination cho cả mock và API thật.
    // isActive bảo vệ state khỏi response đến muộn khi bộ lọc thay đổi liên tục.
    let isActive = true;

    const loadKanji = async () => {
      setIsLoading(true);
      try {
        const data = await getKanjiList({
          page,
          limit: PAGE_LIMIT,
          keyword: searchQuery,
          level: levelFilter,
          status: statusFilter,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        });
        if (!isActive) return;
        setKanjiList(data.items);
        setPagination(data.pagination);
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError.message || 'Không thể tải danh sách Kanji');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadKanji();
    return () => {
      isActive = false;
    };
  }, [levelFilter, page, refreshKey, searchQuery, statusFilter]);

  const reloadKanji = () => {
    // Giữ nguyên query hiện tại và chỉ yêu cầu effect tải lại dữ liệu sau mutation.
    setRefreshKey((current) => current + 1);
  };

  const handleToggleStatus = async (kanji) => {
    try {
      await updateKanjiStatus(kanji.id, {
        status: kanji.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE',
      });
      reloadKanji();
      toast.success(
        kanji.status === 'ACTIVE'
          ? 'Đã ẩn Kanji.'
          : 'Đã hiển thị Kanji.',
      );
    } catch (actionError) {
      toast.error(
        actionError.message || 'Không thể cập nhật trạng thái Kanji',
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedKanji) return;

    try {
      await deleteKanji(selectedKanji.id);
      setSelectedKanji(null);
      if (kanjiList.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        reloadKanji();
      }
      toast.success('Đã xóa Kanji.');
    } catch (actionError) {
      toast.error(actionError.message || 'Không thể xóa Kanji');
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleLevelChange = (event) => {
    setLevelFilter(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const columns = [
    {
      key: 'character',
      label: 'Kanji',
      render: (value) => (
        <span
          style={{
            fontFamily: 'Noto Sans JP, serif',
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'meaning',
      label: 'Nghĩa',
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    { key: 'onyomi', label: 'Onyomi' },
    { key: 'kunyomi', label: 'Kunyomi' },
    {
      key: 'jlptLevel',
      label: 'JLPT',
      render: (value) => (
        <span className="admin-badge admin-badge--info">{value}</span>
      ),
    },
    {
      key: 'strokeCount',
      label: 'Số nét',
      render: (value) => `${value} nét`,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <StatusBadge
          status={value.toLowerCase()}
          customLabel={value === 'ACTIVE' ? 'Hiển thị' : 'Đã ẩn'}
        />
      ),
    },
    {
      key: 'id',
      label: 'Hành động',
      render: (id, row) => (
        <span style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="admin-action-btn"
            title="Sửa"
            onClick={() => navigate(`/admin/kanji/${id}/edit`)}
          >
            <PencilIcon size={16} />
          </button>
          {/* <button
            type="button"
            className="admin-action-btn"
            title={row.status === 'ACTIVE' ? 'Ẩn Kanji' : 'Hiện Kanji'}
            onClick={() => handleToggleStatus(row)}
          >
            <EyeIcon
              size={16}
              style={{ opacity: row.status === 'ACTIVE' ? 1 : 0.5 }}
            />
          </button> */}
          <button
            type="button"
            className="admin-action-btn admin-action-btn--delete"
            title="Xóa"
            onClick={() => setSelectedKanji(row)}
          >
            <TrashIcon size={16} />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Dữ liệu Kanji</h1>
          <p>
            Quản lý toàn bộ bộ chữ Kanji trong hệ thống JELA (
            {pagination.totalItems} chữ)
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => navigate('/admin/kanji/create')}
          >
            <PlusIcon size={16} /> Thêm Kanji
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Tìm theo chữ, nghĩa, on, kun..."
        />
        <select
          className="admin-select"
          value={levelFilter}
          onChange={handleLevelChange}
        >
          <option value="ALL">Tất cả Level</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
        <select
          className="admin-select"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
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
            title="Danh sách Kanji"
            columns={columns}
            rows={kanjiList}
            emptyText="Không tìm thấy Kanji nào phù hợp."
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
        isOpen={Boolean(selectedKanji)}
        onClose={() => setSelectedKanji(null)}
        onConfirm={handleDelete}
        title="Xóa Kanji"
        message={
          <>
            Bạn có chắc chắn muốn xóa Kanji "<strong>{selectedKanji?.character}</strong>" (<strong>{selectedKanji?.meaning}</strong>)?
          </>
        }
        confirmText="Xóa"
        isDanger
      />
    </div>
  );
}
