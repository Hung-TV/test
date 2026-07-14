import { PenLine } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function HandwritingButton({ onClick }) {
  const { messages } = useDictionaryI18n();

  return (
    <button
      type="button"
      className="handwriting-open-button"
      aria-label={messages.openHandwriting}
      onClick={onClick}
    >
      <PenLine size={20} aria-hidden="true" />
      <span>{messages.handwriting}</span>
    </button>
  );
}
