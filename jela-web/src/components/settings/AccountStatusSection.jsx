export default function AccountStatusSection({
  email,
  isLoading,
  isVerified,
  isExternalAccount,
  messages,
  onEditEmail,
  onSendVerification,
}) {
  return (
    <section className="settings-section settings-account">
      <h2>{messages.accountStatus}</h2>

      <div className="settings-account__content">
        <div>
          <span className="settings-eyebrow">{messages.registeredEmail}</span>
          <strong className="settings-account__email">{email || '—'}</strong>
          <div className="settings-account__status">
            <span>{messages.status}:</span>
            <strong className={`verification-badge verification-badge--${isLoading ? 'loading' : isVerified ? 'verified' : 'unverified'}`}>
              {isLoading
                ? messages.checkingEmailStatus
                : isVerified
                  ? messages.verified
                  : messages.unverified}
            </strong>
          </div>
          <p className="settings-help">
            {isExternalAccount ? messages.externalEmailNote : messages.localEmailNote}
          </p>
        </div>

        <div className="settings-account__actions">
          {!isLoading && !isVerified && (
            <button
              type="button"
              className="settings-email-button settings-email-button--primary"
              onClick={onSendVerification}
            >
              {messages.sendVerificationEmail}
            </button>
          )}
          <button
            type="button"
            className="settings-email-button"
            disabled={isLoading || isExternalAccount}
            title={isExternalAccount ? messages.externalEmailNote : undefined}
            onClick={onEditEmail}
          >
            {messages.editEmail}
          </button>
        </div>
      </div>
    </section>
  );
}
