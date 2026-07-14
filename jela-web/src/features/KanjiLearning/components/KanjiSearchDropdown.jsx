import { useKanjiI18n } from '../hooks/useKanjiI18n';

export default function KanjiSearchDropdown({
  isVisible,
  isLoading,
  isDebouncing,
  results,
  onSelect,
}) {
  const { messages, getMeaning } = useKanjiI18n();

  if (!isVisible) return null;

  return (
    <div className="kanji-search-dropdown" role="listbox" aria-label={messages.suggestionsLabel}>
      {isLoading || isDebouncing ? (
        <div className="kanji-search-dropdown__loading">
          <span className="dictionary-spinner" aria-hidden="true" />
          {messages.searching}
        </div>
      ) : results.length === 0 ? (
        <div className="kanji-search-dropdown__empty">
          {messages.noSearchResults}
        </div>
      ) : (
        results.map((item) => (
          <button
            key={item.id}
            type="button"
            className="kanji-search-item"
            role="option"
            onClick={() => onSelect(item)}
          >
            <span className="kanji-search-item__char">{item.character}</span>
            <span className="kanji-search-item__info">
              <strong>{getMeaning(item)}</strong>
              <small>{item.romaji}</small>
            </span>
            <span className="kanji-search-item__romaji">{item.romaji}</span>
          </button>
        ))
      )}
    </div>
  );
}
