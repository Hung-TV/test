import { useState, useEffect, useCallback } from 'react';
import { X, Play } from 'lucide-react';
import '../styles/my-deck.css';

export default function BatchSizeModal({ isOpen, onClose, onConfirm, totalWords, deckType, listName }) {
  const maxLimit = Math.min(20, totalWords || 0);
  const defaultSize = Math.min(5, totalWords || 0);
  const [batchSize, setBatchSize] = useState(defaultSize);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const isEmpty = !totalWords || totalWords <= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEmpty) return;
    onConfirm?.(batchSize);
  };

  return (
    <div className="deck-modal-backdrop" onClick={handleClose}>
      <div
        className="deck-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-size-title"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        <div className="deck-modal__header">
          <h2 id="batch-size-title" className="deck-modal__title" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>Cấu hình học tập</span>
            {listName && (
              <span style={{ fontSize: '13px', color: 'var(--deck-muted, #71717a)', fontWeight: 400 }}>
                Danh sách: <strong style={{ color: 'var(--deck-text, #18181b)' }}>{listName}</strong>
              </span>
            )}
          </h2>
          <button
            type="button"
            className="deck-modal__close"
            aria-label="Đóng"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        <form className="deck-modal__body" onSubmit={handleSubmit}>
          <p style={{ margin: 0, color: 'var(--deck-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            {deckType === 'kanji'
              ? `Chọn số lượng chữ Hán tự bạn muốn học trong lượt này (từ 1 đến tối đa ${maxLimit} chữ).`
              : `Chọn số lượng từ vựng bạn muốn học trong lượt này (từ 1 đến tối đa ${maxLimit} từ).`
            }
          </p>

          {isEmpty ? (
            <div 
              className="deck-error" 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                fontSize: '13px', 
                margin: '8px 0', 
                textAlign: 'center',
                color: 'var(--deck-error)',
                background: 'var(--deck-error-bg)',
                border: '1px solid var(--deck-border)'
              }}
            >
              {deckType === 'kanji'
                ? '⚠️ Danh sách học này hiện chưa có chữ Hán nào. Hãy thêm chữ Hán trước khi bắt đầu học!'
                : '⚠️ Danh sách học này hiện chưa có từ vựng nào. Hãy thêm từ vựng trước khi bắt đầu học!'
              }
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 4px' }}>
                <label htmlFor="batch-size-input" className="deck-modal__label">
                  {deckType === 'kanji' ? `Số lượng chữ Hán (1 - ${maxLimit})` : `Số lượng từ vựng (1 - ${maxLimit})`}
                </label>
                <input
                  id="batch-size-input"
                  type="number"
                  min="1"
                  max={maxLimit}
                  value={batchSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setBatchSize(Math.max(1, Math.min(maxLimit, val)));
                    } else {
                      setBatchSize('');
                    }
                  }}
                  className="deck-modal__input"
                  required
                  autoFocus
                />
              </div>

              <div className="deck-modal__footer" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="deck-modal__btn-cancel"
                  onClick={handleClose}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="deck-modal__btn-create"
                  disabled={!batchSize}
                  style={{ gap: '6px' }}
                >
                  <Play size={16} fill="currentColor" />
                  Bắt đầu học
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
