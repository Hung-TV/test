import { useState } from 'react';

export default function LockAccountModal({ isOpen, onClose, onConfirm, accountName, isLocking }) {
  if (!isOpen) return null;

  return (
    <LockAccountModalContent
      accountName={accountName}
      isLocking={isLocking}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

function LockAccountModalContent({ onClose, onConfirm, accountName, isLocking }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocking && !reason.trim()) {
      setError('Vui lòng nhập lý do khóa tài khoản.');
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 450 }}>
        <div className="admin-modal__header">
          <h2>{isLocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</h2>
          <button className="admin-modal__close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-modal__body">
          <p style={{ marginBottom: 16, color: 'var(--admin-color-on-surface-variant)' }}>
            Bạn có chắc chắn muốn {isLocking ? 'khóa' : 'mở khóa'} tài khoản <strong>{accountName}</strong>?
            {isLocking && ' Tài khoản này sẽ không thể đăng nhập vào hệ thống.'}
          </p>

          {error && (
            <div style={{ padding: 12, marginBottom: 16, backgroundColor: 'var(--admin-color-error-container)', color: 'var(--admin-color-error)', borderRadius: 6, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-form-label">
              Lý do {isLocking ? 'khóa' : 'mở khóa'} {isLocking && <span style={{ color: 'var(--admin-color-error)' }}>*</span>}
            </label>
            <textarea
              className="admin-form-textarea"
              placeholder={`Nhập lý do ${isLocking ? 'khóa' : 'mở khóa'} để ghi log...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="admin-modal__footer" style={{ marginTop: 24 }}>
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>Hủy</button>
            <button type="submit" className={`admin-btn ${isLocking ? 'admin-btn--danger' : 'admin-btn--primary'}`}>
              Xác nhận {isLocking ? 'Khóa' : 'Mở khóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
