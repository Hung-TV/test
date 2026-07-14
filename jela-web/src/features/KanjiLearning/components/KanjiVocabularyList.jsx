import { BookOpen } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';

export default function KanjiVocabularyList({ vocabulariesOn, vocabulariesKun, vocabularies }) {
  const { language, messages, getMeaning } = useKanjiI18n();

  const hasOn = Array.isArray(vocabulariesOn) && vocabulariesOn.length > 0;
  const hasKun = Array.isArray(vocabulariesKun) && vocabulariesKun.length > 0;
  const hasLegacy = Array.isArray(vocabularies) && vocabularies.length > 0;

  if (!hasOn && !hasKun && !hasLegacy) {
    return (
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
        {messages.noVocabulary}
      </p>
    );
  }

  const renderList = (items) => (
    <div className="kanji-vocab-list">
      {items.map((vocab) => (
        <div key={vocab.id ?? vocab.word} className="kanji-vocab-item">
          <div>
            <strong className="kanji-vocab-item__word">{vocab.word}</strong>
            <span className="kanji-vocab-item__reading">{vocab.hiragana}</span>
            {vocab.romaji && <span className="kanji-vocab-item__romaji">{vocab.romaji}</span>}
          </div>
          <span className="kanji-vocab-item__meaning">{getMeaning(vocab)}</span>
        </div>
      ))}
    </div>
  );

  const kunTitle = language === 'en' ? '● Kun-reading Examples' : '● Ví dụ âm Kun';
  const onTitle = language === 'en' ? '● On-reading Examples' : '● Ví dụ âm On';

  return (
    <section className="kanji-vocab-section">
      <h3 className="kanji-vocab-section__heading" style={{ marginBottom: 16 }}>
        <BookOpen size={15} />
        {messages.suggestedVocabulary}
      </h3>

      {hasKun && (
        <div className="kanji-vocab-group" style={{ marginBottom: 20 }}>
          <h4
            className="kanji-vocab-group__title"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-secondary)',
              marginBottom: 8,
              opacity: 0.85,
            }}
          >
            {kunTitle}
          </h4>
          {renderList(vocabulariesKun)}
        </div>
      )}

      {hasOn && (
        <div className="kanji-vocab-group" style={{ marginBottom: 20 }}>
          <h4
            className="kanji-vocab-group__title"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-secondary)',
              marginBottom: 8,
              opacity: 0.85,
            }}
          >
            {onTitle}
          </h4>
          {renderList(vocabulariesOn)}
        </div>
      )}

      {hasLegacy && !hasOn && !hasKun && renderList(vocabularies)}
    </section>
  );
}
