import { useEffect } from 'react';
import '../../styles/toast.css';

function ToastIcon({ type }) {
  if (type === 'success') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.6 2.6L16.5 9" />
      </svg>
    );
  }

  if (type === 'error') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 17h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export default function Toast({
  message,
  type = 'info',
  duration = 3500,
  onClose,
}) {
  useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`app-toast app-toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="app-toast__icon">
        <ToastIcon type={type} />
      </span>
      <p>{message}</p>
      <button type="button" aria-label="Đóng thông báo" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
