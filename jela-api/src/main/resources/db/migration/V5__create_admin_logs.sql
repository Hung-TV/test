-- Migration to create admin_logs table and seed TUTOR role

INSERT INTO roles (role_name) VALUES ('TUTOR') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_logs (
    log_id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    target_user_id BIGINT,
    action_type VARCHAR(100) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_logs_admin FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_logs_target FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
