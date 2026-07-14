-- Thêm vai trò ADMIN và LEARNER nếu chưa có.
INSERT INTO roles (role_id, role_name) VALUES (1, 'LEARNER'), (2, 'ADMIN') ON CONFLICT (role_id) DO NOTHING;

-- Thêm tài khoản admin nếu email 'admin@jela.com' chưa tồn tại.
INSERT INTO users (email, password_hash, full_name, level, status, email_verified, auth_type)
SELECT
    'admin@jela.com',
    '$2a$10$t.p6b/O5j8J.PSBvN3xS9.Lh2xSgXyYmAnH2m3gde3tA.Xh.bL5iO', -- Mật khẩu: admin123
    'Admin JELA',
    'BEGINNER',
    'ACTIVE',
    true,
    'LOCAL'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@jela.com'
);

-- Gán vai trò ADMIN cho tài khoản có email 'admin@jela.com', chỉ khi user đó tồn tại.
INSERT INTO user_roles (user_id, role_id)
SELECT
    (SELECT user_id FROM users WHERE email = 'admin@jela.com'),
    2 -- role_id for ADMIN
WHERE EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@jela.com'
)
ON CONFLICT (user_id, role_id) DO NOTHING;
