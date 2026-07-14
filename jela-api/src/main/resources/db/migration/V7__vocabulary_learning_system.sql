-- ============================================================
-- 1) Bảng lưu tiến độ học từ vựng (Spaced Repetition)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_dictionary_progress (
    progress_id      BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    dictionary_id    BIGINT NOT NULL,
    -- Trạng thái học: NEW → LEARNING → REVIEWING → MASTERED
    status           VARCHAR(20) NOT NULL DEFAULT 'NEW',
    -- Các bước Ebbinghaus (0 -> 5 tương ứng với [1, 3, 7, 14, 21, 60] ngày)
    current_step     INTEGER NOT NULL DEFAULT 0,
    repetitions      INTEGER NOT NULL DEFAULT 0,
    -- Chất lượng đánh giá gần nhất: 1 = Again (Chưa nhớ), 2 = Hard (Khó), 3 = Good (Nhớ tốt)
    last_quality     INTEGER,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_udp_user       FOREIGN KEY (user_id)       REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_udp_dictionary FOREIGN KEY (dictionary_id) REFERENCES dictionary(dictionary_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_vocab_progress UNIQUE (user_id, dictionary_id),
    CONSTRAINT ck_udp_status CHECK (status IN ('NEW', 'LEARNING', 'REVIEWING', 'MASTERED')),
    CONSTRAINT ck_udp_quality CHECK (last_quality IS NULL OR last_quality IN (1, 2, 3))
);

-- ============================================================
-- 2) Thêm các chỉ mục (Indexes) để tăng tốc độ truy vấn ôn tập từ vựng
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_user ON user_dictionary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_next_review ON user_dictionary_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_status ON user_dictionary_progress(user_id, status);
