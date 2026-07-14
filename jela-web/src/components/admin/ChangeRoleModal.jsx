import { useState } from 'react';

export default function ChangeRoleModal({ isOpen, onClose, onConfirm, currentRole, accountName }) {
  if (!isOpen) return null;

  return (
    <ChangeRoleModalContent
      currentRole={currentRole}
      accountName={accountName}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function ChangeRoleModalContent({ onClose, onConfirm, currentRole, accountName }) {
  const [newRole, setNewRole] = useState(currentRole);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newRole === currentRole) {
      setError('Vui lòng chọn một phân quyền mới khác với phân quyền hiện tại.');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thay đổi phân quyền.');
      return;
    }
    onConfirm(newRole, reason);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 450 }}>
        <div className="admin-modal__header">
          <h2>Đổi phân quyền tài khoản</h2>
          <button className="admin-modal__close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-modal__body">
          <p style={{ marginBottom: 16, color: 'var(--admin-color-on-surface-variant)' }}>
            Bạn đang thay đổi phân quyền cho tài khoản <strong>{accountName}</strong>.
          </p>

          {error && (
            <div style={{ padding: 12, marginBottom: 16, backgroundColor: 'var(--admin-color-error-container)', color: 'var(--admin-color-error)', borderRadius: 6, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label">Phân quyền mới</label>
            <select 
              className="admin-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="USER">USER - Học viên</option>
              <option value="TUTOR">TUTOR - Giáo viên</option>
              <option value="ADMIN">ADMIN - Quản trị viên</option>
            </select>
          </div>

          <div className="admin-form-group" style={{ marginTop: 16 }}>
            <label className="admin-form-label">Lý do thay đổi <span style={{ color: 'var(--admin-color-error)' }}>*</span></label>
            <textarea
              className="admin-form-textarea"
              placeholder="Nhập lý do để ghi log hệ thống..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="admin-modal__footer" style={{ marginTop: 24 }}>
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="admin-btn admin-btn--primary">Xác nhận thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
