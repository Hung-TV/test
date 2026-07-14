import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import { EyeIcon } from '../../../components/common/AppIcons';
import adminReportService from '../../../services/admin/adminReportService';
// Adapter mặc định giữ mảng và nhãn tiếng Việt cho UI hiện tại.
// Named API trong service dùng contract phân trang chuẩn cho backend tương lai.

const REPORT_TYPES = ['Tất cả loại lỗi', 'Kanji sai nghĩa', 'Sai âm đọc', 'Sai ví dụ', 'Lỗi giao diện', 'Góp ý khác'];
const REPORT_STATUSES = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã giải quyết' },
  { value: 'REJECTED', label: 'Từ chối' }
];

export default function ReportManagementPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả loại lỗi');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Form Update State
  const [updateStatus, setUpdateStatus] = useState('PENDING');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    let isActive = true;

    adminReportService.getReports()
      .then((data) => {
        if (!isActive) return;
        setReports(data);
        setError(null);
      })
      .catch(() => {
        if (isActive) setError('Lỗi khi tải danh sách báo cáo');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const fetchReports = async () => {
    try {
      const data = await adminReportService.getReports();
      setReports(data);
      setError(null);
    } catch {
      setError('Lỗi khi tải danh sách báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc dữ liệu
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        r.description.toLowerCase().includes(q) || 
        r.reporterName.toLowerCase().includes(q) ||
        r.relatedContent.toLowerCase().includes(q);
      
      const matchesType = typeFilter === 'Tất cả loại lỗi' || r.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, statusFilter]);

  // Mở Modal
  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setUpdateStatus(report.status);
    setAdminNote(report.adminNote || '');
    setModalOpen(true);
  };

  // Cập nhật Report
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      await adminReportService.updateReportStatus(selectedReport.id, updateStatus, adminNote);
      await fetchReports();
      setModalOpen(false);
      toast.success('Đã cập nhật báo cáo.');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật báo cáo');
    }
  };

  // Cấu hình Cột Bảng
  const columns = [
    { key: 'reporter', label: 'Người báo cáo', render: (_, row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{row.reporterName}</div>
        <div style={{ fontSize: 13, color: 'var(--admin-color-on-surface-variant)' }}>{row.reporterEmail}</div>
      </div>
    )},
    { key: 'type', label: 'Loại lỗi', render: (v) => <span style={{ fontWeight: 600, color: 'var(--admin-color-navy)' }}>{v}</span> },
    { key: 'relatedContent', label: 'Nội dung liên quan' },
    { key: 'description', label: 'Mô tả', render: (v) => (
      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v}>
        {v}
      </div>
    )},
    { key: 'date', label: 'Ngày gửi' },
    { key: 'status', label: 'Trạng thái', render: (v) => <StatusBadge status={v} /> },
    { key: 'id', label: 'Hành động', render: (_, row) => (
      <button 
        className="admin-action-btn" 
        title="Xem chi tiết"
        onClick={() => handleOpenDetail(row)}
      >
        <EyeIcon size={16} />
      </button>
    )},
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Báo cáo lỗi</h1>
          <p>Quản lý và phản hồi các lỗi được báo cáo từ học viên</p>
        </div>
      </div>

      <div className="admin-filters">
        <SearchInput 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Tìm theo nội dung, người gửi..." 
        />
        <select 
          className="admin-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {REPORT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select 
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {REPORT_STATUSES.map(st => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-on-surface-variant)' }}>
          Đang tải dữ liệu báo cáo...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-error)' }}>
          {error}
        </div>
      ) : (
        <AdminTable 
          title="Danh sách báo cáo" 
          columns={columns} 
          rows={filteredReports} 
          emptyText={filteredReports.length === 0 ? "Không tìm thấy báo cáo nào phù hợp." : "Chưa có báo cáo lỗi nào."}
        />
      )}

      {/* Modal Chi tiết & Cập nhật */}
      {modalOpen && selectedReport && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <h2 className="admin-modal__title" style={{ marginBottom: 24 }}>Chi tiết Báo cáo #{selectedReport.id}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, fontSize: 14 }}>
              <div>
                <div style={{ color: 'var(--admin-color-on-surface-variant)', marginBottom: 4 }}>Người gửi</div>
                <div style={{ fontWeight: 600 }}>{selectedReport.reporterName}</div>
                <div>{selectedReport.reporterEmail}</div>
              </div>
              <div>
                <div style={{ color: 'var(--admin-color-on-surface-variant)', marginBottom: 4 }}>Ngày gửi</div>
                <div style={{ fontWeight: 600 }}>{selectedReport.date}</div>
              </div>
              <div>
                <div style={{ color: 'var(--admin-color-on-surface-variant)', marginBottom: 4 }}>Loại lỗi</div>
                <div style={{ fontWeight: 600, color: 'var(--admin-color-primary)' }}>{selectedReport.type}</div>
              </div>
              <div>
                <div style={{ color: 'var(--admin-color-on-surface-variant)', marginBottom: 4 }}>Nội dung liên quan</div>
                <div style={{ fontWeight: 600 }}>{selectedReport.relatedContent}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--admin-color-on-surface-variant)', marginBottom: 4 }}>Mô tả chi tiết</div>
                <div style={{ padding: 12, background: 'var(--admin-color-surface-container-highest)', borderRadius: 8, lineHeight: 1.5 }}>
                  {selectedReport.description}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--admin-color-outline)', margin: '24px 0' }} />
            
            <form onSubmit={handleUpdateReport}>
              <h3 style={{ fontSize: 16, margin: '0 0 16px' }}>Khu vực xử lý (Admin)</h3>
              
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-form-label">Cập nhật Trạng thái</label>
                <select 
                  className="admin-select"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 24 }}>
                <label className="admin-form-label">Ghi chú xử lý</label>
                <textarea 
                  className="admin-form-textarea"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ghi chú các bước đã kiểm tra, lý do từ chối..."
                  style={{ minHeight: 100 }}
                />
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="admin-btn admin-btn--outline" onClick={() => setModalOpen(false)}>
                  Đóng
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Cập nhật Báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
