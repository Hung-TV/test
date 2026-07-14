import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LearningCard from '../components/dashboard/LearningCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import UrgentDeadlines from '../components/dashboard/UrgentDeadlines';
import { useAuth } from '../hooks/useAuth';
import dashboardApi from '../api/dashboardApi';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { DASHBOARD_TRANSLATIONS } from '../constants/dashboardTranslations';
import '../styles/dashboard.css';

function getFirstName(user) {
  const fullName = user?.fullName || user?.name || '';
  return fullName.trim().split(/\s+/).at(-1) || 'Huy';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { language } = useAppPreferences();
  const t = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS.vi;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;
    dashboardApi.getStats()
      .then((data) => {
        if (isActive) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isActive) {
          console.error(err);
          setError(t.error);
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [t.error]);

  if (loading) {
    return (
      <main className="dashboard-page" style={{ display: 'grid', placeContent: 'center', minHeight: '300px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', fontWeight: '600' }}>
          {t.loading}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page" style={{ display: 'grid', placeContent: 'center', minHeight: '300px' }}>
        <p style={{ fontSize: '14px', color: '#ff4d4d', fontWeight: '600', textAlign: 'center' }}>
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <h1>{t.welcome.replace('{name}', getFirstName(user))}</h1>
        <p>{t.subtitle}</p>
      </header>

      <StatsGrid 
        streakCount={stats?.streakCount} 
        streakStatus={stats?.streakStatus} 
        wordOfDay={stats?.wordOfDay}
        kanjiOfDay={stats?.kanjiOfDay}
        language={language}
      />

      <section className="dashboard-learning" style={{ gridTemplateColumns: '1fr' }}>
        <div className="continue-learning">
          <div className="section-heading">
            <h2>{t.continueLearning}</h2>
            <Link to="/roadmap">{t.viewRoadmap}</Link>
          </div>

          <div className="learning-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {stats?.learningModules?.map((module) => (
              <LearningCard key={module.title} module={module} language={language} />
            ))}
          </div>
        </div>
      </section>

      <UrgentDeadlines deadlines={stats?.deadlines} language={language} />
    </main>
  );
}
