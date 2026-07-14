CREATE TABLE IF NOT EXISTS dictionary (
    dictionary_id BIGSERIAL PRIMARY KEY,
    kanji TEXT,
    hiragana TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meaning (
    meaning_id BIGSERIAL PRIMARY KEY,
    dictionary_id BIGINT NOT NULL,
    pos TEXT,
    gloss TEXT,
    xref TEXT,
    CONSTRAINT fk_meaning_dictionary FOREIGN KEY (dictionary_id) REFERENCES dictionary(dictionary_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS example (
    example_id BIGSERIAL PRIMARY KEY,
    meaning_id BIGINT NOT NULL,
    ex_text TEXT,
    sentence_jp TEXT,
    sentence_vi TEXT,
    CONSTRAINT fk_example_meaning FOREIGN KEY (meaning_id) REFERENCES meaning(meaning_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kanji (
    kanji_id BIGSERIAL PRIMARY KEY,
    character VARCHAR(10) NOT NULL UNIQUE,
    reading TEXT,
    meanings TEXT[],
    strokes INTEGER,
    radical TEXT,
    shape TEXT,
    readings_on TEXT[],
    readings_kun TEXT[],
    jlpt VARCHAR(5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_dictionary_list (
    list_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    list_name VARCHAR(100) NOT NULL DEFAULT 'My Dictionary List',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_dictionary_list_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_dictionary_list_item (
    item_id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL,
    dictionary_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'LEARNING',
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    learned_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dictionary_list_item_list FOREIGN KEY (list_id) REFERENCES user_dictionary_list(list_id) ON DELETE CASCADE,
    CONSTRAINT fk_dictionary_list_item_dictionary FOREIGN KEY (dictionary_id) REFERENCES dictionary(dictionary_id) ON DELETE CASCADE,
    CONSTRAINT uq_dictionary_item_per_list UNIQUE (list_id, dictionary_id),
    CONSTRAINT ck_dictionary_list_item_status CHECK (status IN ('LEARNING', 'LEARNED', 'ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS user_kanji_list (
    list_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    list_name VARCHAR(100) NOT NULL DEFAULT 'My Kanji List',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_kanji_list_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_kanji_list_item (
    item_id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL,
    kanji_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'LEARNING',
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    learned_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kanji_list_item_list FOREIGN KEY (list_id) REFERENCES user_kanji_list(list_id) ON DELETE CASCADE,
    CONSTRAINT fk_kanji_list_item_kanji FOREIGN KEY (kanji_id) REFERENCES kanji(kanji_id) ON DELETE CASCADE,
    CONSTRAINT uq_kanji_item_per_list UNIQUE (list_id, kanji_id),
    CONSTRAINT ck_kanji_list_item_status CHECK (status IN ('LEARNING', 'LEARNED', 'ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS dictionary_history (
    user_id BIGINT NOT NULL,
    dictionary_id BIGINT NOT NULL,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, dictionary_id),
    CONSTRAINT fk_dictionary_history_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_dictionary_history_dictionary FOREIGN KEY (dictionary_id) REFERENCES dictionary(dictionary_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meaning_dictionary_id ON meaning(dictionary_id);
CREATE INDEX IF NOT EXISTS idx_example_meaning_id ON example(meaning_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_kanji ON dictionary(kanji);
CREATE INDEX IF NOT EXISTS idx_dictionary_hiragana ON dictionary(hiragana);
CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt);

CREATE INDEX IF NOT EXISTS idx_user_dictionary_list_user_id ON user_dictionary_list(user_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_list_item_list_id ON user_dictionary_list_item(list_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_list_item_dictionary_id ON user_dictionary_list_item(dictionary_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_list_item_status ON user_dictionary_list_item(status);

CREATE INDEX IF NOT EXISTS idx_user_kanji_list_user_id ON user_kanji_list(user_id);
CREATE INDEX IF NOT EXISTS idx_kanji_list_item_list_id ON user_kanji_list_item(list_id);
CREATE INDEX IF NOT EXISTS idx_kanji_list_item_kanji_id ON user_kanji_list_item(kanji_id);
CREATE INDEX IF NOT EXISTS idx_kanji_list_item_status ON user_kanji_list_item(status);

CREATE INDEX IF NOT EXISTS idx_dictionary_history_user_searched_at
    ON dictionary_history(user_id, searched_at DESC);
