import { Pen, Search } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';

export default function KanjiSearchBar({ value, onChange, onFocus, onOpenHandwriting }) {
  const { messages } = useKanjiI18n();

  return (
    <div className="kanji-search-row">
      <div className="kanji-search-field">
        <div className="kanji-search-box">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            value={value}
            placeholder={messages.searchPlaceholder}
            aria-label={messages.searchLabel}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
          />
        </div>
      </div>

      <button
        type="button"
        className="kanji-handwriting-btn"
        onClick={onOpenHandwriting}
        title={messages.handwritingTitle}
      >
        <Pen size={17} />
        <span>{messages.handwriting}</span>
      </button>
    </div>
  );
}
