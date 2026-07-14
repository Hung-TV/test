import { BookOpen, Clock } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';
import Pagination from '../../../components/shared/Pagination';

export default function HistoryPanel({
  historyData,
  isLoading,
  lists = [],
  onSelectWord,
  pageable,
  onPageChange,
}) {
  const { messages, formatDate } = useDictionaryI18n();
  const history = Array.isArray(historyData) ? historyData : [];

  return (
    <aside className="dictionary-side-panel">
      <section>
        <h2><Clock size={17} /> {messages.history}</h2>

        {isLoading ? (
          <p className="dictionary-panel-message">{messages.loadingHistory}</p>
        ) : null}

        {!isLoading && historyData === null ? (
          <p className="dictionary-panel-message">{messages.signInForHistory}</p>
        ) : null}

        {!isLoading && historyData !== null && history.length === 0 ? (
          <p className="dictionary-panel-message">{messages.noHistory}</p>
        ) : null}

        {!isLoading && history.length > 0 ? (
          <>
            <div className="history-list">
              {history.map((item) => (
                <button
                  key={`${item.id}-${item.searchedAt || ''}`}
                  type="button"
                  onClick={() => onSelectWord(item.id)}
                >
                  <strong>{item.kanji || messages.fallbackWord}</strong>
                  <time>{formatDate(item.searchedAt)}</time>
                </button>
              ))}
            </div>

            {pageable && onPageChange && (
              <Pagination
                currentPage={pageable.pageNumber}
                totalPages={pageable.totalPages}
                onPageChange={onPageChange}
                isOneBased={true}
                goToLabel="Trang"
              />
            )}
          </>
        ) : null}
      </section>

      <section>
        <h2><BookOpen size={17} /> {messages.myLists}</h2>
        <div className="dictionary-saved-lists">
          {lists.map((list) => (
            <button key={list.id} type="button">
              <span>{list.name}</span>
              <small>{messages.wordCount(list.wordCount ?? 0)}</small>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
