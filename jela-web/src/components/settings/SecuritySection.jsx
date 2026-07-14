export default function SecuritySection({
  isExternalAccount,
  messages,
  onChangePassword,
  passwordUnavailableMessage,
}) {
  return (
    <section className="settings-section">
      <div className="settings-section__title">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <h2>{messages.security}</h2>
      </div>

      <div className="settings-row">
        <div>
          <strong>{messages.securityDescription}</strong>
          <p>
            {isExternalAccount
              ? passwordUnavailableMessage
              : messages.lastChanged}
          </p>
        </div>
        <button
          type="button"
          className="settings-outline-button"
          disabled={isExternalAccount}
          title={isExternalAccount ? passwordUnavailableMessage : undefined}
          onClick={onChangePassword}
        >
          {messages.changePassword}
        </button>
      </div>
    </section>
  );
}
