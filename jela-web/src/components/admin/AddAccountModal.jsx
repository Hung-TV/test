import { useState } from 'react';
import toast from 'react-hot-toast';
import './AddAccountModal.css';

export default function AddAccountModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  return <AddAccountModalContent onClose={onClose} onSubmit={onSubmit} />;
}

function AddAccountModalContent({ onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => ({
    fullName: '',
    email: '',
    role: 'USER',
    status: 'active',
    currentLevel: 'N5',
    tempPassword: '',
    confirmPassword: '',
    mustChangePassword: true,
    note: ''
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Xóa error field khi user gõ lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ.';
    }

    if (!formData.tempPassword) {
      newErrors.tempPassword = 'Vui lòng nhập mật khẩu tạm thời.';
    } else if (formData.tempPassword.length < 8) {
      newErrors.tempPassword = 'Mật khẩu phải từ 8 ký tự trở lên.';
    }

    if (formData.confirmPassword !== formData.tempPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp.';
    }

    if (formData.role === 'USER' && !formData.currentLevel) {
      newErrors.currentLevel = 'Vui lòng chọn cấp độ cho học viên.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      await onSubmit(formData);
    } catch (err) {
      const message = err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay add-account-modal-overlay">
      <div className="admin-modal add-account-modal">
        <div className="admin-modal__header">
          <h2>Thêm tài khoản mới</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal__body">
          {apiError && (
            <div className="add-account-error-alert">
              {apiError}
            </div>
          )}

          <div className="add-account-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">Họ tên <span className="required">*</span></label>
              <input 
                type="text" 
                className="admin-form-input" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ tên"
              />
              {errors.fullName && <span className="admin-form-error">{errors.fullName}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Email <span className="required">*</span></label>
              <input 
                type="email" 
                className="admin-form-input" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
              />
              {errors.email && <span className="admin-form-error">{errors.email}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Phân quyền</label>
              <select className="admin-select" name="role" value={formData.role} onChange={handleChange}>
                <option value="USER">USER - Học viên</option>
                <option value="TUTOR">TUTOR - Giáo viên</option>
                <option value="ADMIN">ADMIN - Quản trị</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Trạng thái</label>
              <select className="admin-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Hoạt động (Active)</option>
                <option value="locked">Khóa (Locked)</option>
              </select>
            </div>

            {formData.role === 'USER' && (
              <div className="admin-form-group">
                <label className="admin-form-label">Cấp độ bắt đầu <span className="required">*</span></label>
                <select className="admin-select" name="currentLevel" value={formData.currentLevel} onChange={handleChange}>
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
                {errors.currentLevel && <span className="admin-form-error">{errors.currentLevel}</span>}
              </div>
            )}
          </div>

          <div className="add-account-section-title">Thiết lập mật khẩu</div>
          
          <div className="add-account-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">Mật khẩu tạm thời <span className="required">*</span></label>
              <input 
                type="password" 
                className="admin-form-input" 
                name="tempPassword"
                value={formData.tempPassword}
                onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
              />
              {errors.tempPassword && <span className="admin-form-error">{errors.tempPassword}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Xác nhận mật khẩu <span className="required">*</span></label>
              <input 
                type="password" 
                className="admin-form-input" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && <span className="admin-form-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="admin-form-group add-account-checkbox-group">
            <label className="add-account-checkbox">
              <input 
                type="checkbox" 
                name="mustChangePassword"
                checked={formData.mustChangePassword}
                onChange={handleChange}
              />
              <span>Yêu cầu người dùng đổi mật khẩu trong lần đăng nhập đầu tiên</span>
            </label>
          </div>

          <div className="admin-form-group" style={{ marginTop: 20 }}>
            <label className="admin-form-label">Ghi chú nội bộ</label>
            <textarea 
              className="admin-form-textarea" 
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Ghi chú thêm về tài khoản này (không bắt buộc)..."
              rows={3}
            />
          </div>

          <div className="admin-modal__footer" style={{ marginTop: 32 }}>
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
