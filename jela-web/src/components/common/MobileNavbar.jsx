import { NavLink } from 'react-router-dom';
import { navigationItems } from '../../data/dashboardData';
import {
  DashboardIcon,
  DictionaryIcon,
  KanjiIcon,
  RoadmapIcon,
  MyDecksIcon,
} from './AppIcons';
import { SHARED_APP_TRANSLATIONS } from '../../constants/settingsConstants';
import { useAppPreferences } from '../../hooks/useAppPreferences';

const icons = {
  dashboard: DashboardIcon,
  roadmap: RoadmapIcon,
  dictionary: DictionaryIcon,
  kanji: KanjiIcon,
  myDecks: MyDecksIcon,
};

export default function MobileNavbar() {
  const { language } = useAppPreferences();
  const copy = SHARED_APP_TRANSLATIONS[language] || SHARED_APP_TRANSLATIONS.vi;

  return (
    <nav className="mobile-navbar" aria-label={copy.mobileNavigation}>
      {navigationItems.map((item) => {
        const Icon = icons[item.icon];

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mobile-navbar__link${isActive ? ' mobile-navbar__link--active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{copy.nav[item.to] || item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
