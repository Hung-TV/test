import SettingSwitch from './SettingSwitch';

export default function NotificationsSection({ values, messages, onChange }) {
  return (
    <section className="settings-section">
      <h2>{messages.notifications}</h2>

      <div className="settings-row">
        <div>
          <strong>{messages.emailNotifications}</strong>
          <p>{messages.emailNotificationsDescription}</p>
        </div>
        <SettingSwitch
          checked={values.email}
          label={messages.emailNotifications}
          onChange={(checked) => onChange('email', checked)}
        />
      </div>

      <div className="settings-row">
        <div>
          <strong>{messages.streakReminders}</strong>
          <p>{messages.streakRemindersDescription}</p>
        </div>
        <SettingSwitch
          checked={values.streak}
          label={messages.streakReminders}
          onChange={(checked) => onChange('streak', checked)}
        />
      </div>
    </section>
  );
}
