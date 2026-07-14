import clsx from 'clsx';
import { BookOpen } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function SearchSuggestionList({
  isLoading,
  isVisible,
  suggestions,
  onSelect,
}) {
  const { messages, getGloss } = useDictionaryI18n();

  if (!isVisible) return null;
  const visibleSuggestions = suggestions.slice(0, 10);

  return (
    <div className="dictionary-suggestions" role="listbox">
      {isLoading ? (
        <div className="dictionary-suggestions__loading" role="status">
          <span className="dictionary-spinner" aria-hidden="true" />
          {messages.searching}
        </div>
      ) : visibleSuggestions.length === 0 ? (
        <p>{messages.noSearchResults}</p>
      ) : (
        visibleSuggestions.map((word, index) => (
          <button
            key={word.id}
            type="button"
            role="option"
            aria-selected="false"
            className={clsx('dictionary-suggestion', {
              'dictionary-suggestion--first': index === 0,
            })}
            onClick={() => onSelect(word)}
          >
            <BookOpen size={18} />
            <span>
              <strong>{word.kanji || word.hiragana}</strong>
              <small>{word.hiragana}</small>
            </span>
            <em>{getGloss(word.meaning?.[0]) || messages.noMeaning}</em>
          </button>
        ))
      )}
    </div>
  );
}
