-- Keep only status column and drop unwanted columns

ALTER TABLE kanji ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE kanji DROP COLUMN IF EXISTS example_japanese;
ALTER TABLE kanji DROP COLUMN IF EXISTS example_vietnamese;
ALTER TABLE kanji DROP COLUMN IF EXISTS mnemonic;
