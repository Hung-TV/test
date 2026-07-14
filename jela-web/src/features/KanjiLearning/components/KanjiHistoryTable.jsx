import { Clock } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';
import { formatKanjiDate } from '../constants/kanjiLearningTranslations';
import Pagination from '../../../components/shared/Pagination';

export default function KanjiHistoryTable({
  history,
  isLoading,
  isAuthenticated,
  selectedKanjiId,
  onSelectKanji,
  onPageChange,
}) {
  const { messages, language } = useKanjiI18n();

  // ── Trạng thái chưa đăng nhập ─────────────────────────────
  if (!isAuthenticated) {
    return (
      <section className="kanji-history-section">
        <h2 className="kanji-section-heading"><Clock size={15} />{messages.history}</h2>
        <p className="kanji-history-message">{messages.signInForHistory}</p>
      </section>
    );
  }

  // ── Đang tải ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="kanji-history-section">
        <h2 className="kanji-section-heading"><Clock size={15} />{messages.history}</h2>
        <div className="kanji-history-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="kanji-history-list__item kanji-history-list__item--skeleton" style={{ justifyContent: 'space-between' }}>
              <span className="kanji-skeleton" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <span className="kanji-skeleton" style={{ width: 100, height: 14 }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Dữ liệu ───────────────────────────────────────────────
  const items    = Array.isArray(history) ? history : (history?.items ?? []);
  const pageable = Array.isArray(history) ? null    : (history?.pageable ?? null);

  if (items.length === 0) {
    return (
      <section className="kanji-history-section">
        <h2 className="kanji-section-heading"><Clock size={15} />{messages.history}</h2>
        <p className="kanji-history-message">{messages.noHistory}</p>
      </section>
    );
  }

  return (
    <section className="kanji-history-section">
      <h2 className="kanji-section-heading"><Clock size={15} />{messages.history}</h2>

      <div className="kanji-history-list">
        {items.map((item) => (
          <button
            key={`${item.kanjiId}-${item.viewedAt}`}
            type="button"
            className={`kanji-history-list__item${selectedKanjiId === item.kanjiId ? ' kanji-history-list__item--selected' : ''}`}
            onClick={() => onSelectKanji(item.kanjiId)}
          >
            <span className="kanji-history-list__char">{item.character}</span>
            <time className="kanji-history-list__time" dateTime={item.viewedAt}>
              {formatKanjiDate(item.viewedAt, language)}
            </time>
          </button>
        ))}
      </div>

      {pageable && onPageChange && (
        <Pagination
          currentPage={pageable.pageNumber ?? 0}
          totalPages={pageable.totalPages ?? 0}
          onPageChange={onPageChange}
          isOneBased={false}
          goToLabel="Đến trang"
        />
      )}
    </section>
  );
}
