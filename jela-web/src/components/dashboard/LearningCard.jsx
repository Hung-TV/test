import { Link } from 'react-router-dom';
import { ClockIcon } from '../common/AppIcons';
import { DASHBOARD_TRANSLATIONS } from '../../constants/dashboardTranslations';

export default function LearningCard({ module, language }) {
  const t = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS.vi;
  const isLinkActive = Boolean(module.link);

  const CardWrapper = isLinkActive ? Link : 'article';
  const wrapperProps = isLinkActive 
    ? { to: module.link, className: 'learning-card learning-card--interactive', style: { textDecoration: 'none', color: 'inherit' } }
    : { className: 'learning-card' };

  const totalCount = module.totalCount || 0;
  const newCount = module.newCount || 0;
  const masteredCount = module.masteredCount || 0;
  
  const learnedCount = totalCount - newCount;
  const learningCount = Math.max(0, learnedCount - masteredCount);

  const totalPercent = totalCount > 0 ? Math.round((learnedCount * 100) / totalCount) : 0;
  const masteredPercent = totalCount > 0 ? (masteredCount * 100) / totalCount : 0;
  const learningPercent = totalCount > 0 ? (learningCount * 100) / totalCount : 0;

  const unit = module.category === 'KANJI' ? t.kanjiUnit : t.wordUnit;
  const isEn = language === 'en';

  // Dịch phần nhãn phân loại (ví dụ: "HÁN TỰ" -> "KANJI")
  let displayReading = module.reading;
  if (isEn) {
    if (displayReading === "HÁN TỰ") {
      displayReading = "KANJI";
    } else if (displayReading === "TỪ VỰNG") {
      displayReading = "VOCAB";
    }
  }

  // Dịch tiêu đề mặc định của hệ thống
  let displayTitle = module.title;
  if (isEn) {
    if (displayTitle === "Hán tự N5 cơ bản") {
      displayTitle = "Basic N5 Kanji";
    } else if (displayTitle === "Từ vựng N5 cơ bản") {
      displayTitle = "Basic N5 Vocabulary";
    }
  }

  // Dịch nhãn thời gian/nút (ví dụ: "Học tiếp" -> "Continue", "Bắt đầu" -> "Start")
  let displayDuration = module.duration;
  if (isEn) {
    if (displayDuration === "Học tiếp") {
      displayDuration = "Continue";
    } else if (displayDuration === "Bắt đầu") {
      displayDuration = "Start";
    }
  }

  return (
    <CardWrapper {...wrapperProps}>
      <div className="learning-card__character">
        <strong lang="ja">{module.character}</strong>
        <span>{displayReading}</span>
      </div>

      <div className="learning-card__body">
        <h3>{displayTitle}</h3>
        
        {/* Segmented linear progress bar */}
        <div className="learning-card-progress">
          <div className="learning-card-progress-bar">
            {/* Pink segment: items currently learning/reviewing */}
            <div 
              className="learning-card-progress-fill learning-card-progress-fill--learning"
              style={{ width: `${learningPercent}%` }}
              title={t.learningTooltip.replace('{count}', learningCount).replace('{unit}', unit)}
            />
            {/* Yellow segment: mastered items */}
            <div 
              className="learning-card-progress-fill learning-card-progress-fill--mastered"
              style={{ width: `${masteredPercent}%` }}
              title={t.masteredTooltip.replace('{count}', masteredCount).replace('{unit}', unit)}
            />
          </div>
          <div className="learning-card-progress-text">
            <span className="progress-count">
              {learnedCount}/{totalCount} {module.category === 'KANJI' ? 'Kanji' : t.wordUnit}
            </span>
            <span className="progress-percent">{totalPercent}%</span>
          </div>
        </div>

        <div className="learning-card__meta" style={{ marginTop: '12px' }}>
          <span><ClockIcon size={13} /> {displayDuration}</span>
          <span className="category-tag">{module.category}</span>
        </div>
      </div>
    </CardWrapper>
  );
}
