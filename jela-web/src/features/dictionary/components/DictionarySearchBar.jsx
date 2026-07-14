import { Search } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function DictionarySearchBar({ value, onChange, onFocus }) {
  const { messages } = useDictionaryI18n();

  return (
    <div className="dictionary-search">
      <Search size={21} aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={messages.searchPlaceholder}
        aria-label={messages.searchLabel}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
      />
    </div>
  );
}
