import { useState } from 'react';
import './focus-study.css';

const getMeaning = (kanjiData, language) => {
  if (language === 'en') {
    return kanjiData?.meaningEn
      || kanjiData?.meanings?.en
      || kanjiData?.meaning;
  }

  return kanjiData?.meaningVi
    || kanjiData?.meanings?.vi
    || kanjiData?.meaning;
};

const formatReading = (reading) => {
  if (Array.isArray(reading)) return reading.join('、');
  return reading || '—';
};

export default function FlippableCard({
  kanjiData,
  language = 'vi',
  labels,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const meaning = getMeaning(kanjiData, language) || '—';

  return (
    <button
      type="button"
      className="focus-card-container"
      onClick={() => setIsFlipped((flipped) => !flipped)}
      aria-label={labels.flipCard}
      aria-pressed={isFlipped}
    >
      <div className={`focus-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="focus-card-face focus-card-front">
          <span className="focus-card-hint">{labels.flipHint}</span>
          <div className="focus-card-kanji-huge" lang="ja">
            {kanjiData.character}
          </div>
          <div className="focus-card-badge-wrap">
            <span className="focus-card-badge">{kanjiData.level || '—'}</span>
          </div>
        </div>

        <div className="focus-card-face focus-card-back">
          <div className="focus-card-kanji-small" lang="ja">
            {kanjiData.character}
          </div>
          <div className="focus-card-back-details">
            <div className="focus-detail-item">
              <span className="focus-detail-label">{labels.meaning}</span>
              <span className="focus-detail-value">{meaning}</span>
            </div>
            <div className="focus-detail-item">
              <span className="focus-detail-label">{labels.onyomi}</span>
              <span className="focus-detail-value-ja" lang="ja">
                {formatReading(kanjiData.onyomi)}
              </span>
            </div>
            <div className="focus-detail-item">
              <span className="focus-detail-label">{labels.kunyomi}</span>
              <span className="focus-detail-value-ja" lang="ja">
                {formatReading(kanjiData.kunyomi)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
