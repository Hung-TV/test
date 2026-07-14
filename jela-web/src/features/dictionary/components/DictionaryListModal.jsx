import { useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function DictionaryListModal({
  isOpen,
  onClose,
  lists,
  isLoading,
  onSelectList,
  onCreateList,
}) {
  const { messages } = useDictionaryI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [listName, setListName] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmitNewList = (event) => {
    event.preventDefault();
    const normalizedName = listName.trim();

    if (!normalizedName) {
      setValidationError('listNameRequired');
      return;
    }

    if (normalizedName.length > 50) {
      setValidationError('listNameTooLong');
      return;
    }

    onCreateList(normalizedName);
  };

  const handleCloseCreateForm = () => {
    setIsCreating(false);
    setListName('');
    setValidationError('');
  };

  return (
    <div
      className="dictionary-modal-backdrop"
      role="presentation"
      onMouseDown={() => !isLoading && onClose()}
    >
      <section
        className="dictionary-list-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dictionary-list-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="dictionary-list-modal__close"
          disabled={isLoading}
          onClick={onClose}
          aria-label={messages.close}
        >
          <X size={20} />
        </button>

        <BookOpen className="dictionary-list-modal__icon" size={26} />
        <h2 id="dictionary-list-modal-title">{messages.addModalTitle}</h2>
        <p>{messages.addModalDescription}</p>

        <div className="dictionary-list-modal__options">
          {isLoading ? (
            <div className="dictionary-list-modal__loading" role="status">
              <span className="dictionary-spinner" aria-hidden="true" />
              {messages.loadingLists}
            </div>
          ) : lists.length === 0 ? (
            <p className="dictionary-list-modal__empty">{messages.noLists}</p>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => onSelectList(list.id)}
              >
                <span>{list.name}</span>
                <small>{messages.wordCount(list.wordCount ?? 0)}</small>
              </button>
            ))
          )}
        </div>

        {isCreating ? (
          <form
            className="dictionary-list-modal__create-form"
            onSubmit={handleSubmitNewList}
            noValidate
          >
            <label htmlFor="new-dictionary-list-name">{messages.newListName}</label>
            <input
              id="new-dictionary-list-name"
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
            <div className="dictionary-list-modal__field-meta">
              <span>{validationError ? messages[validationError] : ''}</span>
              <small>{listName.length}/50</small>
            </div>
            <div className="dictionary-list-modal__create-actions">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCloseCreateForm}
              >
                {messages.cancel}
              </button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? messages.creating : messages.createAndAdd}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="dictionary-list-modal__create-toggle"
            disabled={isLoading}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={18} /> {messages.createNewList}
          </button>
        )}
      </section>
    </div>
  );
}
