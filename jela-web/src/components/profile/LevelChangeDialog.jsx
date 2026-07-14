import { useEffect } from 'react';

export default function LevelChangeDialog({
  isOpen,
  currentLevel,
  nextLevel,
  messages,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="profile-dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="profile-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="level-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-dialog__icon" aria-hidden="true">!</div>
        <h2 id="level-dialog-title">{messages.levelDialogTitle}</h2>
        <p>{messages.levelDialogMessage}</p>
        <div className="profile-dialog__levels">
          <span>{currentLevel}</span>
          <strong aria-hidden="true">→</strong>
          <span>{nextLevel}</span>
        </div>
        <div className="profile-dialog__actions">
          <button type="button" className="profile-button profile-button--ghost" onClick={onCancel}>
            {messages.keepLevel}
          </button>
          <button type="button" className="profile-button profile-button--primary" onClick={onConfirm}>
            {messages.confirmLevel}
          </button>
        </div>
      </section>
    </div>
  );
}
