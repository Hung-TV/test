import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminTable from '../../../components/admin/AdminTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  LockIcon, 
  UnlockIcon, 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '../../../components/common/AppIcons';
import adminLearningPathService from '../../../services/admin/adminLearningPathService';
// Page giữ view-model dạng danh sách bài học phẳng để không đổi layout.
// Service mặc định chuyển contract lộ trình phân cấp về đúng dạng UI đang dùng.

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function LearningPathConfigPage() {
  const [activeLevel, setActiveLevel] = useState('N5');
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', kanjiCount: 0, vocabularyCount: 0, isUnlocked: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let isActive = true;

    adminLearningPathService.getLearningPaths()
      .then((data) => {
        if (!isActive) return;
        setLessons(data);
        setError(null);
      })
      .catch(() => {
        if (isActive) setError('Lỗi khi tải lộ trình học');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const fetchLessons = async () => {
    try {
      const data = await adminLearningPathService.getLearningPaths();
      setLessons(data);
      setError(null);
    } catch {
      setError('Lỗi khi tải lộ trình học');
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc bài học theo level và sort theo order
  const filteredLessons = useMemo(() => {
    return lessons
      .filter(l => l.level === activeLevel)
      .sort((a, b) => a.order - b.order);
  }, [lessons, activeLevel]);

  // Hành động: Xóa
  const handleDelete = async () => {
    if (!selectedLesson) return;
    try {
      await adminLearningPathService.deleteLearningPath(selectedLesson.id);
      await fetchLessons();
      setDeleteModalOpen(false);
      toast.success('Đã xóa bài học.');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa bài học');
    }
  };

  // Hành động: Khóa / Mở
  const handleToggleStatus = async (id) => {
    try {
      await adminLearningPathService.toggleLearningPathStatus(id);
      await fetchLessons();
      toast.success('Đã cập nhật trạng thái bài học.');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi đổi trạng thái');
    }
  };

  // Hành động: Thay đổi thứ tự
  const handleReorder = async (id, direction) => {
    try {
      await adminLearningPathService.reorderLearningPath(id, direction);
      await fetchLessons();
      toast.success('Đã cập nhật thứ tự bài học.');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi đổi thứ tự');
    }
  };

  // Quản lý Form (Thêm/Sửa)
  const openForm = (lesson = null) => {
    if (lesson) {
      setSelectedLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description,
        kanjiCount: lesson.kanjiCount,
        vocabularyCount: lesson.vocabularyCount,
        isUnlocked: lesson.isUnlocked
      });
    } else {
      setSelectedLesson(null);
      setFormData({
        title: '', description: '', kanjiCount: 0, vocabularyCount: 0, isUnlocked: true
      });
    }
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Tên bài học không được để trống';
    if (!formData.description.trim()) errors.description = 'Mô tả không được để trống';
    if (formData.kanjiCount < 0) errors.kanjiCount = 'Số Kanji không hợp lệ';
    if (formData.vocabularyCount < 0) errors.vocabularyCount = 'Số Từ vựng không hợp lệ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEditing = Boolean(selectedLesson);
    if (selectedLesson) {
      // Sửa
      setLessons(prev => prev.map(l => 
        l.id === selectedLesson.id 
          ? { ...l, ...formData, kanjiCount: parseInt(formData.kanjiCount), vocabularyCount: parseInt(formData.vocabularyCount) }
          : l
      ));
    } else {
      // Thêm mới (Cấp order cuối cùng cho level này)
      const maxOrder = filteredLessons.length > 0 
        ? Math.max(...filteredLessons.map(l => l.order)) 
        : 0;
      
      const newLesson = {
        ...formData,
        id: Date.now(), // Fake ID
        level: activeLevel,
        order: maxOrder + 1,
        kanjiCount: parseInt(formData.kanjiCount),
        vocabularyCount: parseInt(formData.vocabularyCount)
      };
      setLessons(prev => [...prev, newLesson]);
    }
    setFormModalOpen(false);
    toast.success(
      isEditing ? 'Đã cập nhật bài học.' : 'Đã thêm bài học mới.',
    );
  };

  // Columns cho Table
  const columns = [
    { key: 'order', label: 'Thứ tự', render: (v) => <span style={{ fontWeight: 600, color: 'var(--admin-color-navy)' }}>#{v}</span> },
    { key: 'title', label: 'Tên bài học', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{v}</div>
        <div style={{ fontSize: 13, color: 'var(--admin-color-on-surface-variant)' }}>{row.description}</div>
      </div>
    )},
    { key: 'content', label: 'Nội dung', render: (_, row) => (
      <span style={{ fontSize: 13 }}>
        {row.kanjiCount} Kanji, {row.vocabularyCount} Từ vựng
      </span>
    )},
    { key: 'isUnlocked', label: 'Trạng thái', render: (v) => (
      <StatusBadge 
        status={v ? 'active' : 'locked'} 
        customLabel={v ? 'Đang mở' : 'Đã khóa'} 
      />
    )},
    { key: 'id', label: 'Hành động', render: (id, row) => (
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Reorder actions */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: 8, gap: 2 }}>
          <button 
            className="admin-reorder-btn" 
            title="Lên trên"
            onClick={() => handleReorder(id, 'up')}
            disabled={row.order === Math.min(...filteredLessons.map(l => l.order))}
          >
            <ArrowUpIcon size={14} />
          </button>
          <button 
            className="admin-reorder-btn" 
            title="Xuống dưới"
            onClick={() => handleReorder(id, 'down')}
            disabled={row.order === Math.max(...filteredLessons.map(l => l.order))}
          >
            <ArrowDownIcon size={14} />
          </button>
        </div>
        
        {/* Main actions */}
        <button 
          className="admin-action-btn" 
          title="Sửa"
          onClick={() => openForm(row)}
        >
          <PencilIcon size={16} />
        </button>
        <button 
          className={`admin-action-btn ${row.isUnlocked ? 'admin-action-btn--delete' : ''}`}
          title={row.isUnlocked ? 'Khóa bài học' : 'Mở bài học'}
          onClick={() => handleToggleStatus(id)}
        >
          {row.isUnlocked ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
        </button>
        <button 
          className="admin-action-btn admin-action-btn--delete" 
          title="Xóa"
          onClick={() => {
            setSelectedLesson(row);
            setDeleteModalOpen(true);
          }}
        >
          <TrashIcon size={16} />
        </button>
      </span>
    )},
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Cấu hình Lộ trình</h1>
          <p>Quản lý các bài học theo cấp độ JLPT cho học viên</p>
        </div>
      </div>

      <div className="admin-layout-2col">
        {/* Sidebar Level */}
        <div className="admin-side-menu">
          {LEVELS.map(level => (
            <button
              key={level}
              className={`admin-side-menu__btn ${activeLevel === level ? 'admin-side-menu__btn--active' : ''}`}
              onClick={() => setActiveLevel(level)}
            >
              <span>{level}</span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                {lessons.filter(l => l.level === level).length} bài
              </span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Lộ trình {activeLevel}</h2>
            <button 
              className="admin-btn admin-btn--primary"
              onClick={() => openForm()}
            >
              <PlusIcon size={16} /> Thêm bài học {activeLevel}
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-on-surface-variant)' }}>
              Đang tải lộ trình...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-error)' }}>
              {error}
            </div>
          ) : (
            <AdminTable 
              columns={columns} 
              rows={filteredLessons} 
              emptyText={`Chưa có bài học nào cho cấp độ ${activeLevel}.`}
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa bài học"
        message={`Bạn có chắc chắn muốn xóa "${selectedLesson?.title}"? Hành động này sẽ xóa dữ liệu cấu hình lộ trình của bài học này.`}
        confirmText="Xóa bài học"
        isDanger={true}
      />

      {/* Form Modal (Thêm/Sửa) */}
      {formModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 500 }}>
            <h2 className="admin-modal__title">{selectedLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</h2>
            <p className="admin-modal__message" style={{ marginBottom: 20 }}>
              Cấp độ: <strong style={{ color: 'var(--admin-color-primary)' }}>{activeLevel}</strong>
            </p>
            
            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-form-label">Tên bài học <span className="admin-form-label__required">*</span></label>
                <input 
                  type="text" name="title" className="admin-form-input" 
                  value={formData.title} onChange={handleFormChange}
                />
                {formErrors.title && <span className="admin-form-error">{formErrors.title}</span>}
              </div>

              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-form-label">Mô tả ngắn <span className="admin-form-label__required">*</span></label>
                <input 
                  type="text" name="description" className="admin-form-input" 
                  value={formData.description} onChange={handleFormChange}
                />
                {formErrors.description && <span className="admin-form-error">{formErrors.description}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Số lượng Kanji</label>
                  <input 
                    type="number" name="kanjiCount" min="0" className="admin-form-input" 
                    value={formData.kanjiCount} onChange={handleFormChange}
                  />
                  {formErrors.kanjiCount && <span className="admin-form-error">{formErrors.kanjiCount}</span>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Số lượng Từ vựng</label>
                  <input 
                    type="number" name="vocabularyCount" min="0" className="admin-form-input" 
                    value={formData.vocabularyCount} onChange={handleFormChange}
                  />
                  {formErrors.vocabularyCount && <span className="admin-form-error">{formErrors.vocabularyCount}</span>}
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 24 }}>
                <label className="admin-form-label">Trạng thái mở khóa (Mặc định)</label>
                <div className="admin-form-radio-group">
                  <label className="admin-form-radio">
                    <input 
                      type="radio" name="isUnlocked" checked={formData.isUnlocked === true}
                      onChange={() => setFormData(prev => ({ ...prev, isUnlocked: true }))}
                    />
                    Đang mở
                  </label>
                  <label className="admin-form-radio">
                    <input 
                      type="radio" name="isUnlocked" checked={formData.isUnlocked === false}
                      onChange={() => setFormData(prev => ({ ...prev, isUnlocked: false }))}
                    />
                    Khóa lại
                  </label>
                </div>
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="admin-btn admin-btn--outline" onClick={() => setFormModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {selectedLesson ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
