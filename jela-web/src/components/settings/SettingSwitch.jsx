export default function SettingSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`setting-switch${checked ? ' setting-switch--checked' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}
