package com.jela.api.dataimport;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class StartupDataImporter {

    private static final Logger log = LoggerFactory.getLogger(StartupDataImporter.class);

    private static final String DICTIONARY_FILE = "dictionary.csv";
    private static final String MEANING_FILE = "meaning.csv";
    private static final String EXAMPLE_FILE = "example.csv";
    private static final String KANJI_FILE = "kanji_bank_jlpt.json";

    private final JdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DataImportProperties properties;

    public StartupDataImporter(
            JdbcTemplate jdbcTemplate,
            TransactionTemplate transactionTemplate,
            DataImportProperties properties
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.transactionTemplate = transactionTemplate;
        this.properties = properties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void importDataOnStartup() {
        if (!properties.isEnabled()) {
            log.info("Startup data import is disabled.");
            return;
        }

        Path dataDir = properties.resolveDataDir();
        if (!Files.isDirectory(dataDir)) {
            log.warn("Startup data import skipped because data directory does not exist: {}", dataDir);
            return;
        }

        int batchSize = Math.max(1, properties.getBatchSize());
        log.info("Checking startup data import from {}", dataDir);
        importDictionaryGroupIfEmpty(dataDir, batchSize);
        importKanjiIfEmpty(dataDir, batchSize);
    }

    private void importDictionaryGroupIfEmpty(Path dataDir, int batchSize) {
        long dictionaryCount = countRows("dictionary");
        long meaningCount = countRows("meaning");
        long exampleCount = countRows("example");

        if (dictionaryCount == 0 && meaningCount == 0 && exampleCount == 0) {
            performDictionaryImport(dataDir, batchSize);
            return;
        }

        if (dictionaryCount > 0 && meaningCount > 0 && exampleCount > 0) {
            log.info(
                    "Dictionary startup data already exists; skipped import. Counts: dictionary={}, meaning={}, example={}",
                    dictionaryCount,
                    meaningCount,
                    exampleCount
            );
            return;
        }

        log.warn(
                "Partial dictionary data detected (dictionary={}, meaning={}, example={}). Cleaning up tables for a clean re-import...",
                dictionaryCount,
                meaningCount,
                exampleCount
        );

        transactionTemplate.executeWithoutResult(status -> {
            jdbcTemplate.execute("TRUNCATE TABLE example, meaning, dictionary CASCADE");
        });

        performDictionaryImport(dataDir, batchSize);
    }

    private void performDictionaryImport(Path dataDir, int batchSize) {
        log.info("Starting clean dictionary data import...");
        long importedDictionaries = importDictionary(dataDir.resolve(DICTIONARY_FILE), batchSize);
        long importedMeanings = importMeaning(dataDir.resolve(MEANING_FILE), batchSize);
        long importedExamples = importExample(dataDir.resolve(EXAMPLE_FILE), batchSize);

        resetSequence("dictionary", "dictionary_id");
        resetSequence("meaning", "meaning_id");
        resetSequence("example", "example_id");

        log.info(
                "Imported startup dictionary data successfully: dictionary={}, meaning={}, example={}",
                importedDictionaries,
                importedMeanings,
                importedExamples
        );
    }

    private void importKanjiIfEmpty(Path dataDir, int batchSize) {
        long kanjiCount = countRows("kanji");
        if (kanjiCount > 0) {
            log.info("Kanji startup data already exists; skipped import. Count: {}", kanjiCount);
            return;
        }

        long importedKanji = importKanji(dataDir.resolve(KANJI_FILE), batchSize);
        resetSequence("kanji", "kanji_id");
        log.info("Imported startup kanji data successfully: kanji={}", importedKanji);
    }

    private long importDictionary(Path path, int batchSize) {
        String sql = """
                INSERT INTO dictionary (dictionary_id, kanji, hiragana)
                VALUES (?, ?, ?)
                """;

        return readCsvInBatches(path, batchSize, DataImportRecordMapper::toDictionaryRow, batch ->
                transactionTemplate.executeWithoutResult(status ->
                        jdbcTemplate.batchUpdate(sql, batch, batch.size(), (ps, row) -> {
                            ps.setLong(1, row.dictionaryId());
                            ps.setString(2, row.kanji());
                            ps.setString(3, row.hiragana());
                        })
                )
        );
    }

    private long importMeaning(Path path, int batchSize) {
        String sql = """
                INSERT INTO meaning (meaning_id, dictionary_id, pos, gloss, xref)
                VALUES (?, ?, ?, ?, ?)
                """;

        return readCsvInBatches(path, batchSize, DataImportRecordMapper::toMeaningRow, batch ->
                transactionTemplate.executeWithoutResult(status ->
                        jdbcTemplate.batchUpdate(sql, batch, batch.size(), (ps, row) -> {
                            ps.setLong(1, row.meaningId());
                            ps.setLong(2, row.dictionaryId());
                            ps.setString(3, row.pos());
                            ps.setString(4, row.gloss());
                            ps.setString(5, row.xref());
                        })
                )
        );
    }

    private long importExample(Path path, int batchSize) {
        String sql = """
                INSERT INTO example (example_id, meaning_id, ex_text, sentence_jp, sentence_vi)
                VALUES (?, ?, ?, ?, ?)
                """;

        return readCsvInBatches(path, batchSize, DataImportRecordMapper::toExampleRow, batch ->
                transactionTemplate.executeWithoutResult(status ->
                        jdbcTemplate.batchUpdate(sql, batch, batch.size(), (ps, row) -> {
                            ps.setLong(1, row.exampleId());
                            ps.setLong(2, row.meaningId());
                            ps.setString(3, row.exText());
                            ps.setString(4, row.sentenceJp());
                            ps.setString(5, row.sentenceVi());
                        })
                )
        );
    }

    private long importKanji(Path path, int batchSize) {
        requireReadableFile(path);

        String sql = """
                INSERT INTO kanji
                    (character, reading, meanings, strokes, radical, shape, readings_on, readings_kun, jlpt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try {
            JsonNode root = objectMapper.readTree(path.toFile());
            if (!root.isArray()) {
                throw new IllegalArgumentException("Kanji JSON root must be an array: " + path);
            }

            long imported = 0;
            List<DataImportRecordMapper.KanjiRow> batch = new ArrayList<>(batchSize);
            for (JsonNode entry : root) {
                batch.add(DataImportRecordMapper.toKanjiRow(entry));
                if (batch.size() >= batchSize) {
                    writeKanjiBatch(sql, batch);
                    imported += batch.size();
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                writeKanjiBatch(sql, batch);
                imported += batch.size();
            }

            return imported;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read kanji JSON file: " + path, ex);
        }
    }

    private void writeKanjiBatch(String sql, List<DataImportRecordMapper.KanjiRow> batch) {
        transactionTemplate.executeWithoutResult(status ->
            jdbcTemplate.batchUpdate(sql, batch, batch.size(), (ps, row) -> {
                ps.setString(1, row.character());
                ps.setString(2, row.reading());
                setTextArray(ps, 3, row.meanings());
                if (row.strokes() == null) {
                    ps.setNull(4, java.sql.Types.INTEGER);
                } else {
                    ps.setInt(4, row.strokes());
                }
                ps.setString(5, row.radical());
                ps.setString(6, row.shape());
                setTextArray(ps, 7, row.readingsOn());
                setTextArray(ps, 8, row.readingsKun());
                ps.setString(9, row.jlpt());
            })
        );
    }

    private <T> long readCsvInBatches(
            Path path,
            int batchSize,
            CsvRecordMapper<T> mapper,
            BatchWriter<T> writer
    ) {
        requireReadableFile(path);

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setDelimiter('|')
                .setQuote('"')
                .setHeader()
                .setSkipHeaderRecord(true)
                .get();

        try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             CSVParser parser = format.parse(reader)) {
            long imported = 0;
            List<T> batch = new ArrayList<>(batchSize);

            for (var record : parser) {
                batch.add(mapper.map(record));
                if (batch.size() >= batchSize) {
                    writer.write(batch);
                    imported += batch.size();
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                writer.write(batch);
                imported += batch.size();
            }

            return imported;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read CSV file: " + path, ex);
        }
    }

    private void setTextArray(PreparedStatement ps, int parameterIndex, String[] values) throws SQLException {
        Array array = ps.getConnection().createArrayOf("text", values == null ? new String[0] : values);
        ps.setArray(parameterIndex, array);
    }

    private long countRows(String tableName) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);
        return count == null ? 0L : count;
    }

    private void resetSequence(String tableName, String idColumnName) {
        String sql = """
                SELECT setval(
                    COALESCE(
                        pg_get_serial_sequence('%1$s', '%2$s'),
                        pg_get_serial_sequence('public.%1$s', '%2$s'),
                        '%1$s_%2$s_seq',
                        'public.%1$s_%2$s_seq'
                    ),
                    COALESCE((SELECT MAX(%2$s) FROM %1$s), 1),
                    (SELECT COUNT(*) > 0 FROM %1$s)
                )
                """.formatted(tableName, idColumnName);
        jdbcTemplate.queryForObject(sql, Long.class);
    }

    private void requireReadableFile(Path path) {
        if (!Files.isRegularFile(path) || !Files.isReadable(path)) {
            throw new IllegalStateException("Required startup import file is missing or unreadable: " + path);
        }
    }

    @FunctionalInterface
    private interface CsvRecordMapper<T> {
        T map(org.apache.commons.csv.CSVRecord record);
    }

    @FunctionalInterface
    private interface BatchWriter<T> {
        void write(List<T> batch);
    }
}
