import { Plus, X } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';
import KanjiVocabularyList from './KanjiVocabularyList';

const renderReadingLines = (reading) => {
  if (!reading) return '—';
  const list = Array.isArray(reading) ? reading : [reading];
  const expandedList = list.flatMap((r) => (typeof r === 'string' ? r.split(/,\s*/) : [r]));
  const cleanList = expandedList.map((r) => r && r.trim()).filter(Boolean);
  if (cleanList.length === 0) return '—';

  return (
    <div className="kanji-reading-lines">
      {cleanList.map((r, idx) => (
        <span key={idx} className="kanji-reading-line">• {r}</span>
      ))}
    </div>
  );
};

export default function KanjiDetailPanel({
  isOpen,
  onClose,
  kanji,
  isLoading,
  isError,
  onAddToList,
}) {
  const { messages, getMeaning } = useKanjiI18n();

  if (!isOpen) return null;

  const closeButton = (
    <button
      type="button"
      className="kanji-modal__close"
      onClick={onClose}
      aria-label={messages.close}
    >
      <X size={20} />
    </button>
  );

  if (!kanji && !isLoading && !isError) {
    return (
      <div className="kanji-modal-backdrop" onClick={onClose}>
        <aside className="kanji-detail-modal" onClick={(event) => event.stopPropagation()}>
          {closeButton}
          <div className="kanji-detail-panel__empty">
            <span aria-hidden="true">漢</span>
            <h3>{messages.detailTitle}</h3>
            <p>{messages.selectForDetail}</p>
          </div>
        </aside>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="kanji-modal-backdrop" onClick={onClose}>
        <aside className="kanji-detail-modal" onClick={(event) => event.stopPropagation()}>
          {closeButton}
          <div className="kanji-detail-panel__content-wrapper">
            <div className="kanji-detail-panel__left">
              <div className="kanji-detail-panel__header">
                <span className="kanji-skeleton" style={{ height: 20, width: 40, borderRadius: 999 }} />
                <span className="kanji-skeleton" style={{ height: 80, width: 80 }} />
                <span className="kanji-skeleton" style={{ height: 18, width: '60%' }} />
              </div>
              <div className="kanji-detail-panel__body">
                <div className="kanji-info-grid">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <span key={index} className="kanji-skeleton" style={{ height: 52 }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="kanji-detail-panel__right">
              <div className="kanji-vocab-section">
                <div className="kanji-vocab-list">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <span key={index} className="kanji-skeleton" style={{ height: 60, borderRadius: 10 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="kanji-modal-backdrop" onClick={onClose}>
        <aside className="kanji-detail-modal" onClick={(event) => event.stopPropagation()}>
          {closeButton}
          <div className="kanji-detail-panel__empty">
            <span aria-hidden="true">!</span>
            <h3>{messages.errorTitle}</h3>
            <p>{messages.detailLoadError}</p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="kanji-modal-backdrop" onClick={onClose}>
      <aside className="kanji-detail-modal" onClick={(event) => event.stopPropagation()}>
        {closeButton}
        <div className="kanji-detail-panel__content-wrapper">
          <div className="kanji-detail-panel__left">
            <div className="kanji-detail-panel__header">
              <span className="kanji-detail-panel__level-badge">JLPT {kanji.level}</span>
              <div className="kanji-detail-panel__char" lang="ja">{kanji.character}</div>
            </div>

            <div className="kanji-detail-panel__body">
              <div className="kanji-info-grid">
                <div className="kanji-info-box">
                  <span className="kanji-info-box__label">{messages.onyomi}</span>
                  <span className="kanji-info-box__value" lang="ja">{renderReadingLines(kanji.onyomi)}</span>
                </div>
                <div className="kanji-info-box">
                  <span className="kanji-info-box__label">{messages.kunyomi}</span>
                  <span className="kanji-info-box__value" lang="ja">{renderReadingLines(kanji.kunyomi)}</span>
                </div>
                <div className="kanji-info-box">
                  <span className="kanji-info-box__label">{messages.romaji}</span>
                  <span className="kanji-info-box__value--plain">
                    {kanji.romaji ? kanji.romaji.toUpperCase() : '—'}
                  </span>
                </div>
                <div className="kanji-info-box">
                  <span className="kanji-info-box__label">{messages.strokeCount}</span>
                  <span className="kanji-info-box__value--plain">{kanji.strokeCount ?? '—'}</span>
                </div>
                <div className="kanji-info-box kanji-info-box--full">
                  <span className="kanji-info-box__label">{messages.radical}</span>
                  <span className="kanji-info-box__value--plain">
                    {(() => {
                      if (!kanji.radical) return '—';
                      const parts = kanji.radical.split(' ');
                      if (parts.length > 0) {
                        parts[0] = parts[0].toUpperCase();
                      }
                      return parts.join(' ');
                    })()}
                  </span>
                </div>
                <div className="kanji-info-box kanji-info-box--full">
                  <span className="kanji-info-box__label">{messages.meaning}</span>
                  <div className="kanji-meaning-block-content" style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(() => {
                      const rawMeaning = getMeaning(kanji);
                      if (!rawMeaning) return <span className="kanji-info-box__value--plain">—</span>;
                      const items = rawMeaning.split(/;\s*(?=\[)/);
                      return items.map((item, idx) => {
                        // Định dạng IN HOA âm Hán-Việt trong ngoặc vuông (ví dụ: [Y] cái áo)
                        const upperItem = item.replace(/\[([^\]]+)\]/g, (match, p1) => `[${p1.toUpperCase()}]`);
                        return (
                          <div key={idx} style={{ fontSize: 13, fontWeight: 550, color: 'var(--color-on-surface)', lineHeight: 1.35 }}>
                            {upperItem}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="kanji-add-btn"
              onClick={onAddToList}
            >
              <Plus size={16} />
              {messages.addToLearningList}
            </button>
          </div>

          <div className="kanji-detail-panel__right">
            <KanjiVocabularyList
              vocabulariesOn={kanji.vocabulariesOn}
              vocabulariesKun={kanji.vocabulariesKun}
              vocabularies={kanji.vocabularies}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
