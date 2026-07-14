import SettingSwitch from './SettingSwitch';

export default function PreferencesSection({
  language,
  theme,
  messages,
  onLanguageChange,
  onThemeChange,
}) {
  return (
    <section className="settings-section">
      <h2>{messages.preferences}</h2>

      <div className="settings-row settings-row--compact">
        <div className="settings-label-with-icon">
          <span aria-hidden="true">☼</span>
          <strong>{messages.darkMode}</strong>
        </div>
        <SettingSwitch
          checked={theme === 'dark'}
          label={messages.darkMode}
          onChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        />
      </div>

      <div className="settings-row settings-row--compact">
        <div className="settings-label-with-icon">
          <span aria-hidden="true">文</span>
          <strong>{messages.appLanguage}</strong>
        </div>
        <select
          className="settings-language"
          value={language}
          aria-label={messages.appLanguage}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>
    </section>
  );
}
