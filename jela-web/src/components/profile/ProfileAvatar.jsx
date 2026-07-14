import { useRef, useState } from 'react';
import { prepareProfileImage } from '../../utils/profileImage';
import { ProfileIcon } from '../common/AppIcons';

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileAvatar({
  avatar,
  originalAvatar,
  displayName,
  isGoogleAccount,
  messages,
  onAvatarChange,
}) {
  const inputRef = useRef(null);
  const [imageError, setImageError] = useState('');
  const hasChangedAvatar = avatar !== originalAvatar;

  const handleFileChange = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';

    if (!file) return;

    try {
      setImageError('');
      const preparedImage = await prepareProfileImage(file);
      onAvatarChange(preparedImage);
    } catch (error) {
      setImageError(error.message);
    }
  };

  return (
    <section className="profile-identity">
      <div className="profile-avatar">
        {/* Lớp media chịu trách nhiệm crop ảnh. Không đặt overflow lên profile-avatar
            vì nút chỉnh ảnh cần nằm nổi ra ngoài đường viền hình tròn. */}
        <div className="profile-avatar__media">
          {avatar ? (
            <img src={avatar} alt={messages.avatarAlt} />
          ) : (
            <span aria-hidden="true">
              {getInitials(displayName) || <ProfileIcon size={32} />}
            </span>
          )}
        </div>

        <button
          type="button"
          className="profile-avatar__edit"
          aria-label={messages.editPhoto}
          title={messages.editPhoto}
          onClick={() => inputRef.current?.click()}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <input
        ref={inputRef}
        className="profile-avatar__input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      <h1>{displayName}</h1>
      <p className="profile-identity__hint">
        {isGoogleAccount ? messages.googlePhoto : messages.localPhoto}
      </p>

      <button
        type="button"
        className="profile-avatar__change"
        onClick={() => inputRef.current?.click()}
      >
        {messages.editPhoto}
      </button>

      {hasChangedAvatar && (
        <button
          type="button"
          className="profile-avatar__reset"
          onClick={() => {
            setImageError('');
            onAvatarChange(originalAvatar);
          }}
        >
          {messages.removePhoto}
        </button>
      )}

      {imageError && <span className="profile-field-error">{imageError}</span>}
    </section>
  );
}
