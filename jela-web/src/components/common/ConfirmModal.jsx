import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDanger = false,
}) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div 
        className="admin-modal" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ maxWidth: 450 }}
      >
        <div className="admin-modal__header">
          <h2 id="modal-title">{title}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <p className="admin-modal__message">{message}</p>
        
        <div className="admin-modal__footer" style={{ marginTop: 24 }}>
          <button className="admin-btn admin-btn--outline" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`admin-btn ${isDanger ? 'admin-btn--danger' : 'admin-btn--primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
