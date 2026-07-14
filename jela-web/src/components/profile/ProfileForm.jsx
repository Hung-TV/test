import { PROFILE_LEVELS } from '../../constants/profileConstants';

export default function ProfileForm({
  form,
  errors,
  messages,
  isSaving,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <form className="profile-form" onSubmit={onSubmit} noValidate>
      <div className="profile-form__heading">
        <div>
          <p className="dashboard-label">{messages.profileLabel}</p>
          <h2>{messages.personalInfo}</h2>
        </div>
        <span className="profile-form__required">{messages.required}</span>
      </div>

      <div className="profile-form__grid">
        <div className="profile-field">
          <label htmlFor="profile-full-name">
            {messages.fullName} <span aria-hidden="true">*</span>
          </label>
          <input
            id="profile-full-name"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'profile-full-name-error' : undefined}
          />
          {errors.fullName && (
            <span id="profile-full-name-error" className="profile-field-error">
              {errors.fullName}
            </span>
          )}
        </div>

        <div className="profile-field">
          <label htmlFor="profile-email">{messages.email}</label>
          <input id="profile-email" value={form.email} readOnly aria-describedby="profile-email-note" />
          <small id="profile-email-note">{messages.emailNote}</small>
        </div>

        <div className="profile-field">
          <label htmlFor="profile-phone">
            {messages.phone} <span aria-hidden="true">*</span>
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0912 345 678"
            value={form.phone}
            onChange={onChange}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
          />
          {errors.phone && (
            <span id="profile-phone-error" className="profile-field-error">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="profile-field">
          <label htmlFor="profile-level">{messages.level}</label>
          <select
            id="profile-level"
            name="level"
            value={form.level}
            onChange={onChange}
            aria-describedby="profile-level-note"
          >
            {PROFILE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <small id="profile-level-note">{messages.levelNote}</small>
        </div>
      </div>

      <section className="profile-learning-status">
        <div className="profile-learning-status__icon" aria-hidden="true">✦</div>
        <div>
          <strong>{messages.learningStatus}</strong>
          <p>{messages.learningStatusText}</p>
        </div>
        <div className="profile-learning-status__bar" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="profile-form__actions">
        <button
          type="button"
          className="profile-button profile-button--ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          {messages.cancel}
        </button>
        <button
          type="submit"
          className="profile-button profile-button--primary"
          disabled={isSaving}
        >
          {isSaving ? messages.saving : messages.save}
        </button>
      </div>
    </form>
  );
}
