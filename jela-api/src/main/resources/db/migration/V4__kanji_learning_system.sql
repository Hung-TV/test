-- ============================================================
-- 1) Lịch sử tra cứu Kanji (tương tự dictionary_history)
-- ============================================================
CREATE TABLE IF NOT EXISTS kanji_history (
    user_id     BIGINT NOT NULL,
    kanji_id    BIGINT NOT NULL,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, kanji_id),
    CONSTRAINT fk_kanji_history_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_kanji_history_kanji FOREIGN KEY (kanji_id)
        REFERENCES kanji(kanji_id) ON DELETE CASCADE
);

-- ============================================================
-- 2) Tiến độ học Kanji của user (Spaced Repetition - Ebbinghaus)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_kanji_progress (
    progress_id      BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    kanji_id         BIGINT NOT NULL,
    -- Trạng thái học: NEW → LEARNING → REVIEWING → MASTERED
    status           VARCHAR(20) NOT NULL DEFAULT 'NEW',
    -- Ebbinghaus fixed intervals step index (0→5):
    -- 0=1 ngày, 1=3 ngày, 2=7 ngày, 3=14 ngày, 4=21 ngày, 5=60 ngày
    current_step     INTEGER NOT NULL DEFAULT 0,
    repetitions      INTEGER NOT NULL DEFAULT 0,
    -- Điểm phản hồi lần gần nhất (1=Again, 2=Hard, 3=Good)
    last_quality     INTEGER,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ukp_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_ukp_kanji FOREIGN KEY (kanji_id) REFERENCES kanji(kanji_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_kanji_progress UNIQUE (user_id, kanji_id),
    CONSTRAINT ck_ukp_status CHECK (status IN ('NEW', 'LEARNING', 'REVIEWING', 'MASTERED')),
    CONSTRAINT ck_ukp_quality CHECK (last_quality IS NULL OR last_quality IN (1, 2, 3))
);

-- ============================================================
-- 3) Kanji list source type
-- ============================================================
ALTER TABLE user_kanji_list
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(30) NOT NULL DEFAULT 'CUSTOM';

ALTER TABLE user_kanji_list
    ADD CONSTRAINT ck_user_kanji_list_source_type
        CHECK (source_type IN ('CUSTOM', 'JLPT_LEVEL'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_kanji_list_jlpt_source_name
    ON user_kanji_list (user_id, source_type, list_name)
    WHERE source_type = 'JLPT_LEVEL';

-- ============================================================
-- 4) Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_kanji_history_user_searched
    ON kanji_history(user_id, searched_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_kanji_progress_user
    ON user_kanji_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_kanji_progress_next_review
    ON user_kanji_progress(user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_user_kanji_progress_status
    ON user_kanji_progress(user_id, status);

CREATE INDEX IF NOT EXISTS idx_kanji_reading
    ON kanji(reading);

CREATE INDEX IF NOT EXISTS idx_kanji_character
    ON kanji(character);

-- ============================================================
-- 5) Search acceleration (Dictionary + Kanji)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_dictionary_kanji_trgm
    ON dictionary USING GIN (kanji gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_dictionary_hiragana_trgm
    ON dictionary USING GIN (hiragana gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_meaning_gloss_trgm
    ON meaning USING GIN (gloss gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_kanji_character_trgm
    ON kanji USING GIN (character gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_kanji_reading_trgm
    ON kanji USING GIN (reading gin_trgm_ops);

