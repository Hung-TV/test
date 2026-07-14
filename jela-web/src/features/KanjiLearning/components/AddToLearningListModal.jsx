import { useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';

export default function AddToLearningListModal({
  isOpen,
  onClose,
  kanji,
  lists,
  isAuthenticated,
  isLoading,
  onSelectList,
  onCreateList,
}) {
  const { messages, getMeaning } = useKanjiI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [listName, setListName] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setIsCreating(false);
    setListName('');
    setValidationError('');
    onClose();
  };

  const handleSubmitNew = (event) => {
    event.preventDefault();
    const name = listName.trim();
    if (!name) {
      setValidationError('listNameRequired');
      return;
    }
    if (name.length > 50) {
      setValidationError('listNameTooLong');
      return;
    }
    onCreateList(name);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setListName('');
    setValidationError('');
  };

  return (
    <div className="kanji-modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section
        className="kanji-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kanji-list-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="kanji-modal__close"
          disabled={isLoading}
          onClick={handleClose}
          aria-label={messages.close}
        >
          <X size={20} />
        </button>

        <BookOpen size={26} color="var(--color-primary)" />
        <h2 id="kanji-list-modal-title" style={{ margin: '10px 0 4px', color: 'var(--color-primary)' }}>
          {messages.addModalTitle}
        </h2>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
          {messages.addModalDescription}
        </p>

        {kanji && (
          <div className="kanji-modal__kanji-preview">
            <strong lang="ja">{kanji.character}</strong>
            <span>{getMeaning(kanji)}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="kanji-modal__auth-notice">{messages.signInRequired}</div>
        ) : (
          <>
            <div className="kanji-modal__lists">
              {isLoading && !isCreating ? (
                <div className="kanji-modal__loading">
                  <span className="dictionary-spinner" aria-hidden="true" />
                  {messages.loading}
                </div>
              ) : !Array.isArray(lists) || lists.length === 0 ? (
                <p className="kanji-modal__empty">{messages.noLists}</p>
              ) : (
                lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelectList(list.id)}
                  >
                    <span>{list.name}</span>
                    <small>{messages.listItemCount(list.itemCount ?? 0)}</small>
                  </button>
                ))
              )}
            </div>

            {isCreating ? (
              <form className="kanji-modal__create-form" onSubmit={handleSubmitNew} noValidate>
                <label htmlFor="kanji-new-list-name">{messages.newListName}</label>
                <input
                  id="kanji-new-list-name"
                  type="text"
                  value={listName}
                  maxLength={50}
                  placeholder={messages.newListPlaceholder}
                  disabled={isLoading}
                  aria-invalid={Boolean(validationError)}
                  onChange={(event) => {
                    setListName(event.target.value);
                    if (validationError) setValidationError('');
                  }}
                />
                {validationError && (
                  <span style={{ color: '#ba1a1a', fontSize: 11 }}>
                    {messages[validationError]}
                  </span>
                )}
                <div className="kanji-modal__create-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    disabled={isLoading}
                    onClick={handleCancelCreate}
                  >
                    {messages.cancel}
                  </button>
                  <button type="submit" className="btn-create" disabled={isLoading}>
                    {isLoading ? messages.creating : messages.createList}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="kanji-modal__create-toggle"
                disabled={isLoading}
                onClick={() => setIsCreating(true)}
              >
                <Plus size={16} /> {messages.createNewList}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
