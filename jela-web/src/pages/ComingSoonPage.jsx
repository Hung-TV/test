import { useLocation } from 'react-router-dom';
import { useAppPreferences } from '../hooks/useAppPreferences';

const translations = {
  vi: {
    spaceLabel: 'KHÔNG GIAN HỌC TẬP JELA',
    roadmap: {
      title: 'Lộ trình học tập',
      description: 'Lộ trình học tập sẽ được hiển thị tại đây.',
    },
  },
  en: {
    spaceLabel: 'JELA LEARNING SPACE',
    roadmap: {
      title: 'Learning Roadmap',
      description: 'The learning roadmap will be displayed here soon.',
    },
  },
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const { language } = useAppPreferences();
  const t = translations[language] || translations.vi;

  const pageKey = pathname === '/roadmap' ? 'roadmap' : 'roadmap';
  const content = t[pageKey];

  return (
    <main className="placeholder-page">
      <p className="dashboard-label">{t.spaceLabel}</p>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
    </main>
  );
}
