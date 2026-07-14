import { Plus, Star } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';
import MeaningSection from './MeaningSection';

function WordDetailSkeleton() {
  const { messages } = useDictionaryI18n();

  return (
    <article className="word-detail-card word-detail-skeleton" role="status">
      <div className="word-detail-skeleton__header">
        <span />
        <span />
        <span />
      </div>
      <div className="word-detail-skeleton__body">
        <span />
        <span />
        <span />
      </div>
      <p className="sr-only">{messages.loadingDetails}</p>
    </article>
  );
}

export default function WordDetailCard({
  word,
  isLoading,
  isSavingFavorite = false,
  onAddToDeck,
  onSaveFavorite,
}) {
  const { messages } = useDictionaryI18n();

  if (isLoading) return <WordDetailSkeleton />;
  if (!word) return null;

  return (
    <article className="word-detail-card">
      <header className="word-detail-card__header">
        <div>
          <span className="word-detail-card__label">{messages.wordLabel}</span>
          <h2>{word.kanji || word.hiragana || '—'}</h2>
          {word.kanji && word.hiragana && word.kanji !== word.hiragana && <p>{word.hiragana}</p>}
        </div>

        <div className="word-detail-card__actions">
          <button
            type="button"
            disabled={isSavingFavorite}
            onClick={onSaveFavorite}
          >
            <Star size={18} />
            {isSavingFavorite ? messages.saving : messages.favorite}
          </button>
          <button type="button" onClick={onAddToDeck}>
            <Plus size={18} />
            {messages.addToList}
          </button>
        </div>
      </header>

      <MeaningSection meanings={word.meaning || word.meanings} />
    </article>
  );
}
