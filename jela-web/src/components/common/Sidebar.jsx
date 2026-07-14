import { NavLink } from 'react-router-dom';
import { navigationItems } from '../../data/dashboardData';
import {
  DashboardIcon,
  DictionaryIcon,
  RoadmapIcon,
  KanjiIcon,
  MyDecksIcon,
} from './AppIcons';
import Brand from './Brand';
import { SHARED_APP_TRANSLATIONS } from '../../constants/settingsConstants';
import { useAppPreferences } from '../../hooks/useAppPreferences';

const icons = {
  dashboard: DashboardIcon,
  roadmap: RoadmapIcon,
  dictionary: DictionaryIcon,
  kanji: KanjiIcon,
  myDecks: MyDecksIcon,
};

export default function Sidebar({ isOpen, onClose }) {
  const { language } = useAppPreferences();
  const copy = SHARED_APP_TRANSLATIONS[language] || SHARED_APP_TRANSLATIONS.vi;

  return (
    <>
      <aside className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}>
        <Brand />

        <nav className="app-sidebar__nav" aria-label={copy.navigation}>
          {navigationItems.map((item) => {
            const Icon = icons[item.icon];

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{copy.nav[item.to] || item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <NavLink to="/roadmap" className="app-sidebar__lesson" onClick={onClose}>
          {copy.startLesson}
        </NavLink>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={onClose}
        />
      )}
    </>
  );
}
