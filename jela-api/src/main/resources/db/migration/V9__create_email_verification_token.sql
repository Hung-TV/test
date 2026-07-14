CREATE TABLE IF NOT EXISTS email_verification_tokens (
    verification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
