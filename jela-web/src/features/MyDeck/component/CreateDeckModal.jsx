import { useCallback, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useMyDeckI18n } from '../hooks/useMyDeckI18n';

export default function CreateDeckModal({ isLoading, onClose, onCreate }) {
  const { messages } = useMyDeckI18n();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('dictionary');

  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose?.();
  }, [isLoading, onClose]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isLoading) return;
    onCreate?.(trimmedTitle, type);
  }, [isLoading, onCreate, title, type]);

  useEffect(() => {
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
  }, [handleClose]);

  return (
    <div className="deck-modal-backdrop" onClick={handleClose}>
      <div
        className="deck-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-deck-title"
        aria-busy={isLoading}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="deck-modal__header">
          <h2 id="create-deck-title" className="deck-modal__title">
            {messages.createModalTitle}
          </h2>
          <button
            type="button"
            className="deck-modal__close"
            aria-label={messages.close}
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form className="deck-modal__body" onSubmit={handleSubmit}>
          <label htmlFor="deck-title-input" className="deck-modal__label">
            {messages.deckName}
          </label>
          <input
            id="deck-title-input"
            type="text"
            className="deck-modal__input"
            placeholder={messages.deckNamePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            autoFocus
            disabled={isLoading}
          />

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="deck-modal__label">{messages.listType}</span>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="deck-type"
                  value="dictionary"
                  checked={type === 'dictionary'}
                  onChange={() => setType('dictionary')}
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                />
                <span>{messages.listTypeVocab}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="deck-type"
                  value="kanji"
                  checked={type === 'kanji'}
                  onChange={() => setType('kanji')}
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                />
                <span>{messages.listTypeKanji}</span>
              </label>
            </div>
          </div>

          <div className="deck-modal__footer">
            <button
              type="button"
              className="deck-modal__btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              {messages.cancel}
            </button>
            <button
              type="submit"
              className="deck-modal__btn-create"
              disabled={!title.trim() || isLoading}
            >
              <Plus size={16} />
              {isLoading ? messages.creating : messages.createDeck}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
