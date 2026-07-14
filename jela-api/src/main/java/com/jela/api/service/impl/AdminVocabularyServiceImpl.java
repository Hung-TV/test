package com.jela.api.service.impl;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.*;
import com.jela.api.entity.Dictionary;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.DictionaryRepository;
import com.jela.api.service.AdminVocabularyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminVocabularyServiceImpl implements AdminVocabularyService {

    private final DictionaryRepository dictionaryRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional(readOnly = true)
    public AdminVocabularyListResponse getVocabularyList(
            String keyword,
            String level,
            String status,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    ) {
        String dbKeyword = keyword != null && !keyword.isBlank() ? "%" + keyword.trim() + "%" : null;
        String dbLevel = level != null && !level.equalsIgnoreCase("ALL") ? level.trim() : null;
        String dbStatus = status != null && !status.equalsIgnoreCase("ALL") ? status.trim().toUpperCase() : null;

        // Build count query
        StringBuilder countSql = new StringBuilder("""
            SELECT COUNT(DISTINCT d.dictionary_id)
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            WHERE 1=1
        """);
        List<Object> countParams = new ArrayList<>();
        if (dbKeyword != null) {
            countSql.append(" AND (d.kanji ILIKE ? OR d.hiragana ILIKE ? OR m.gloss ILIKE ?)");
            countParams.add(dbKeyword);
            countParams.add(dbKeyword);
            countParams.add(dbKeyword);
        }
        if (dbLevel != null) {
            countSql.append(" AND m.xref LIKE ?");
            countParams.add("%JLPT:" + dbLevel + "%");
        }
        if (dbStatus != null) {
            if (dbStatus.equals("ACTIVE")) {
                countSql.append(" AND (m.xref LIKE '%STATUS:ACTIVE%' OR m.xref IS NULL OR (m.xref NOT LIKE '%STATUS:HIDDEN%' AND m.xref NOT LIKE '%STATUS:DELETED%'))");
            } else if (dbStatus.equals("HIDDEN")) {
                countSql.append(" AND m.xref LIKE '%STATUS:HIDDEN%'");
            } else if (dbStatus.equals("DELETED")) {
                countSql.append(" AND m.xref LIKE '%STATUS:DELETED%'");
            }
        } else {
            countSql.append(" AND (m.xref IS NULL OR m.xref NOT LIKE '%STATUS:DELETED%')");
        }

        long totalItems = jdbcTemplate.queryForObject(countSql.toString(), Long.class, countParams.toArray());

        if (totalItems == 0) {
            return AdminVocabularyListResponse.builder()
                    .items(Collections.emptyList())
                    .pagination(AdminVocabularyListResponse.PaginationResponse.builder()
                            .page(page)
                            .limit(limit)
                            .totalItems(0)
                            .totalPages(0)
                            .build())
                    .build();
        }

        // Build list query
        StringBuilder listSql = new StringBuilder("""
            SELECT DISTINCT d.dictionary_id, d.kanji, d.hiragana, d.updated_at
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            WHERE 1=1
        """);
        List<Object> listParams = new ArrayList<>(countParams);
        if (dbKeyword != null) {
            listSql.append(" AND (d.kanji ILIKE ? OR d.hiragana ILIKE ? OR m.gloss ILIKE ?)");
        }
        if (dbLevel != null) {
            listSql.append(" AND m.xref LIKE ?");
        }
        if (dbStatus != null) {
            if (dbStatus.equals("ACTIVE")) {
                listSql.append(" AND (m.xref LIKE '%STATUS:ACTIVE%' OR m.xref IS NULL OR (m.xref NOT LIKE '%STATUS:HIDDEN%' AND m.xref NOT LIKE '%STATUS:DELETED%'))");
            } else if (dbStatus.equals("HIDDEN")) {
                listSql.append(" AND m.xref LIKE '%STATUS:HIDDEN%'");
            } else if (dbStatus.equals("DELETED")) {
                listSql.append(" AND m.xref LIKE '%STATUS:DELETED%'");
            }
        } else {
            listSql.append(" AND (m.xref IS NULL OR m.xref NOT LIKE '%STATUS:DELETED%')");
        }

        // Sorting
        String sortCol = "d.updated_at";
        if (sortBy != null) {
            switch (sortBy) {
                case "word" -> sortCol = "d.kanji";
                case "kana" -> sortCol = "d.hiragana";
                case "updatedAt" -> sortCol = "d.updated_at";
            }
        }
        String dir = "DESC";
        if (sortOrder != null && sortOrder.equalsIgnoreCase("asc")) {
            dir = "ASC";
        }
        listSql.append(" ORDER BY ").append(sortCol).append(" ").append(dir).append(", d.dictionary_id DESC");

        // Pagination
        listSql.append(" LIMIT ? OFFSET ?");
        listParams.add(limit);
        listParams.add((page - 1) * limit);

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(listSql.toString(), listParams.toArray());

        List<AdminVocabularyResponse> items = new ArrayList<>();
        for (var row : rows) {
            Long dictionaryId = ((Number) row.get("dictionary_id")).longValue();
            String kanji = (String) row.get("kanji");
            String hiragana = (String) row.get("hiragana");
            java.sql.Timestamp updatedAtTs = (java.sql.Timestamp) row.get("updated_at");
            Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();

            List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                    "SELECT gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                    dictionaryId
            );

            String meaning = "";
            String jlpt = "N5";
            String itemStatus = "ACTIVE";

            if (!meaningRows.isEmpty()) {
                var mRow = meaningRows.get(0);
                meaning = (String) mRow.get("gloss");
                String xref = (String) mRow.get("xref");

                if (xref != null) {
                    jlpt = parseFromXref(xref, "JLPT", "N5");
                    itemStatus = parseFromXref(xref, "STATUS", "ACTIVE");
                }
            }

            items.add(AdminVocabularyResponse.builder()
                    .id(dictionaryId)
                    .word(kanji != null && !kanji.isBlank() ? kanji : hiragana)
                    .kana(hiragana)
                    .meaning(meaning)
                    .jlptLevel(jlpt)
                    .status(itemStatus)
                    .updatedAt(updatedAt)
                    .build());
        }

        int totalPages = (int) Math.ceil((double) totalItems / limit);

        return AdminVocabularyListResponse.builder()
                .items(items)
                .pagination(AdminVocabularyListResponse.PaginationResponse.builder()
                        .page(page)
                        .limit(limit)
                        .totalItems(totalItems)
                        .totalPages(totalPages)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminVocabularyDetailResponse getVocabularyById(Long id) {
        Dictionary dict = dictionaryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng với ID: " + id));

        List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                "SELECT meaning_id, pos, gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                id
        );

        String pos = "";
        String meaning = "";
        String jlpt = "N5";
        String status = "ACTIVE";
        String exampleJapanese = "";
        String exampleVietnamese = "";

        if (!meaningRows.isEmpty()) {
            var mRow = meaningRows.get(0);
            Long meaningId = ((Number) mRow.get("meaning_id")).longValue();
            pos = (String) mRow.get("pos");
            meaning = (String) mRow.get("gloss");
            String xref = (String) mRow.get("xref");

            if (xref != null) {
                jlpt = parseFromXref(xref, "JLPT", "N5");
                status = parseFromXref(xref, "STATUS", "ACTIVE");
            }

            List<Map<String, Object>> exampleRows = jdbcTemplate.queryForList(
                    "SELECT sentence_jp, sentence_vi FROM example WHERE meaning_id = ? ORDER BY example_id ASC LIMIT 1",
                    meaningId
            );
            if (!exampleRows.isEmpty()) {
                var exRow = exampleRows.get(0);
                exampleJapanese = (String) exRow.get("sentence_jp");
                exampleVietnamese = (String) exRow.get("sentence_vi");
            }
        }

        return AdminVocabularyDetailResponse.builder()
                .id(dict.getDictionaryId())
                .word(dict.getKanji())
                .kana(dict.getHiragana())
                .meaning(meaning)
                .jlptLevel(jlpt)
                .partOfSpeech(pos)
                .exampleJapanese(exampleJapanese)
                .exampleVietnamese(exampleVietnamese)
                .status(status)
                .createdAt(dict.getCreatedAt())
                .updatedAt(dict.getUpdatedAt())
                .build();
    }

    @Override
    public AdminVocabularyDetailResponse createVocabulary(AdminCreateVocabularyRequest request) {
        String kanji = request.getWord().trim();
        String hiragana = request.getKana().trim();

        if (dictionaryRepository.existsByKanjiAndHiragana(kanji, hiragana)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Từ vựng này đã tồn tại trên hệ thống");
        }

        Dictionary dict = Dictionary.builder()
                .kanji(kanji)
                .hiragana(hiragana)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        dict = dictionaryRepository.save(dict);

        Long meaningId = jdbcTemplate.queryForObject("SELECT nextval('meaning_meaning_id_seq')", Long.class);
        String xref = packXref(request.getJlptLevel(), request.getStatus(), null);
        String pos = request.getPartOfSpeech() != null ? request.getPartOfSpeech().trim() : "";

        jdbcTemplate.update(
                "INSERT INTO meaning (meaning_id, dictionary_id, pos, gloss, xref) VALUES (?, ?, ?, ?, ?)",
                meaningId, dict.getDictionaryId(), pos, request.getMeaning().trim(), xref
        );

        String sentenceJp = request.getExampleJapanese();
        String sentenceVi = request.getExampleVietnamese();
        Long exampleId = null;
        if (sentenceJp != null && !sentenceJp.isBlank()) {
            exampleId = jdbcTemplate.queryForObject("SELECT nextval('example_example_id_seq')", Long.class);
            jdbcTemplate.update(
                    "INSERT INTO example (example_id, meaning_id, ex_text, sentence_jp, sentence_vi) VALUES (?, ?, ?, ?, ?)",
                    exampleId, meaningId, sentenceJp.trim(), sentenceJp.trim(), sentenceVi != null ? sentenceVi.trim() : ""
            );
        }

        // Sync to CSV files
        syncDictionaryToCsv(dict.getDictionaryId(), dict.getKanji(), dict.getHiragana());
        syncMeaningToCsv(meaningId, dict.getDictionaryId(), pos, request.getMeaning().trim(), xref);
        if (exampleId != null) {
            syncExampleToCsv(exampleId, meaningId, sentenceJp.trim(), sentenceJp.trim(), sentenceVi != null ? sentenceVi.trim() : "");
        }

        return getVocabularyById(dict.getDictionaryId());
    }

    @Override
    public AdminVocabularyDetailResponse updateVocabulary(Long id, AdminUpdateVocabularyRequest request) {
        Dictionary dict = dictionaryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng với ID: " + id));

        String kanji = request.getWord().trim();
        String hiragana = request.getKana().trim();

        if (dictionaryRepository.existsByKanjiAndHiraganaAndDictionaryIdNot(kanji, hiragana, id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Từ vựng này đã tồn tại trên hệ thống");
        }

        dict.setKanji(kanji);
        dict.setHiragana(hiragana);
        dict.setUpdatedAt(Instant.now());
        dict = dictionaryRepository.save(dict);

        List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                "SELECT meaning_id, pos, gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                id
        );

        Long meaningId;
        String originalXref = null;
        String pos = request.getPartOfSpeech() != null ? request.getPartOfSpeech().trim() : "";

        if (meaningRows.isEmpty()) {
            meaningId = jdbcTemplate.queryForObject("SELECT nextval('meaning_meaning_id_seq')", Long.class);
            String xref = packXref(request.getJlptLevel(), request.getStatus(), null);
            jdbcTemplate.update(
                    "INSERT INTO meaning (meaning_id, dictionary_id, pos, gloss, xref) VALUES (?, ?, ?, ?, ?)",
                    meaningId, id, pos, request.getMeaning().trim(), xref
            );
        } else {
            var mRow = meaningRows.get(0);
            meaningId = ((Number) mRow.get("meaning_id")).longValue();
            originalXref = (String) mRow.get("xref");
            String xref = packXref(request.getJlptLevel(), request.getStatus(), originalXref);
            jdbcTemplate.update(
                    "UPDATE meaning SET pos = ?, gloss = ?, xref = ? WHERE meaning_id = ?",
                    pos, request.getMeaning().trim(), xref, meaningId
            );
        }

        String xref = packXref(request.getJlptLevel(), request.getStatus(), originalXref);

        String sentenceJp = request.getExampleJapanese();
        String sentenceVi = request.getExampleVietnamese();
        Long exampleId = null;

        if (sentenceJp != null && !sentenceJp.isBlank()) {
            List<Map<String, Object>> exampleRows = jdbcTemplate.queryForList(
                    "SELECT example_id FROM example WHERE meaning_id = ? ORDER BY example_id ASC LIMIT 1",
                    meaningId
            );
            if (exampleRows.isEmpty()) {
                exampleId = jdbcTemplate.queryForObject("SELECT nextval('example_example_id_seq')", Long.class);
                jdbcTemplate.update(
                        "INSERT INTO example (example_id, meaning_id, ex_text, sentence_jp, sentence_vi) VALUES (?, ?, ?, ?, ?)",
                        exampleId, meaningId, sentenceJp.trim(), sentenceJp.trim(), sentenceVi != null ? sentenceVi.trim() : ""
                );
            } else {
                exampleId = ((Number) exampleRows.get(0).get("example_id")).longValue();
                jdbcTemplate.update(
                        "UPDATE example SET ex_text = ?, sentence_jp = ?, sentence_vi = ? WHERE example_id = ?",
                        sentenceJp.trim(), sentenceJp.trim(), sentenceVi != null ? sentenceVi.trim() : "", exampleId
                );
            }
        } else {
            List<Long> exIds = jdbcTemplate.queryForList(
                    "SELECT example_id FROM example WHERE meaning_id = ?",
                    Long.class, meaningId
            );
            jdbcTemplate.update("DELETE FROM example WHERE meaning_id = ?", meaningId);
            for (Long exId : exIds) {
                deleteCsvRow(getCsvPath("example.csv"), exId);
            }
        }

        syncDictionaryToCsv(id, dict.getKanji(), dict.getHiragana());
        syncMeaningToCsv(meaningId, id, pos, request.getMeaning().trim(), xref);
        if (sentenceJp != null && !sentenceJp.isBlank()) {
            syncExampleToCsv(exampleId, meaningId, sentenceJp.trim(), sentenceJp.trim(), sentenceVi != null ? sentenceVi.trim() : "");
        }

        return getVocabularyById(id);
    }

    @Override
    public AdminVocabularyDetailResponse updateVocabularyStatus(Long id, AdminUpdateVocabularyStatusRequest request) {
        List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                "SELECT meaning_id, pos, gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                id
        );

        if (meaningRows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng hoặc ý nghĩa");
        }

        var mRow = meaningRows.get(0);
        Long meaningId = ((Number) mRow.get("meaning_id")).longValue();
        String pos = (String) mRow.get("pos");
        String gloss = (String) mRow.get("gloss");
        String originalXref = (String) mRow.get("xref");

        String currentJlpt = parseFromXref(originalXref, "JLPT", "N5");
        String newStatus = request.getStatus().trim().toUpperCase();

        String xref = packXref(currentJlpt, newStatus, originalXref);

        jdbcTemplate.update(
                "UPDATE meaning SET xref = ? WHERE meaning_id = ?",
                xref, meaningId
        );

        jdbcTemplate.update("UPDATE dictionary SET updated_at = NOW() WHERE dictionary_id = ?", id);

        syncMeaningToCsv(meaningId, id, pos, gloss, xref);

        return getVocabularyById(id);
    }

    @Override
    public void deleteVocabulary(Long id) {
        List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                "SELECT meaning_id, pos, gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                id
        );

        if (meaningRows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng");
        }

        var mRow = meaningRows.get(0);
        Long meaningId = ((Number) mRow.get("meaning_id")).longValue();
        String pos = (String) mRow.get("pos");
        String gloss = (String) mRow.get("gloss");
        String originalXref = (String) mRow.get("xref");

        String currentJlpt = parseFromXref(originalXref, "JLPT", "N5");
        String xref = packXref(currentJlpt, "DELETED", originalXref);

        jdbcTemplate.update(
                "UPDATE meaning SET xref = ? WHERE meaning_id = ?",
                xref, meaningId
        );

        syncMeaningToCsv(meaningId, id, pos, gloss, xref);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkVocabularyExists(String word, String kana) {
        if (word == null || word.isBlank() || kana == null || kana.isBlank()) {
            return Map.of("exists", false);
        }
        Optional<Dictionary> existingOpt = dictionaryRepository.findByKanjiAndHiragana(word.trim(), kana.trim());
        if (existingOpt.isPresent()) {
            Dictionary dict = existingOpt.get();
            List<Map<String, Object>> meaningRows = jdbcTemplate.queryForList(
                    "SELECT gloss, xref FROM meaning WHERE dictionary_id = ? ORDER BY meaning_id ASC LIMIT 1",
                    dict.getDictionaryId()
            );

            String meaning = "";
            String jlpt = "N5";

            if (!meaningRows.isEmpty()) {
                var mRow = meaningRows.get(0);
                meaning = (String) mRow.get("gloss");
                String xref = (String) mRow.get("xref");
                if (xref != null) {
                    jlpt = parseFromXref(xref, "JLPT", "N5");
                }
            }

            Map<String, Object> res = new HashMap<>();
            res.put("exists", true);
            res.put("word", dict.getKanji());
            res.put("kana", dict.getHiragana());
            res.put("meaning", meaning);
            res.put("jlpt", jlpt);
            return res;
        }
        return Map.of("exists", false);
    }

    // Helper: Parse value from xref string (e.g. JLPT:N5|STATUS:ACTIVE)
    private String parseFromXref(String xref, String key, String defaultValue) {
        if (xref == null || xref.isBlank()) {
            return defaultValue;
        }
        String[] parts = xref.split("\\|");
        for (String part : parts) {
            if (part.startsWith(key + ":")) {
                return part.substring(key.length() + 1);
            }
        }
        return defaultValue;
    }

    // Helper: Pack values into xref string
    private String packXref(String jlpt, String status, String originalXref) {
        String base = originalXref != null ? originalXref : "";
        String[] parts = base.split("\\|");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.startsWith("JLPT:") && !part.startsWith("STATUS:") && !part.isBlank()) {
                if (sb.length() > 0) sb.append("|");
                sb.append(part);
            }
        }
        if (sb.length() > 0) sb.append("|");
        sb.append("JLPT:").append(jlpt != null ? jlpt.trim().toUpperCase() : "N5");
        sb.append("|STATUS:").append(status != null ? status.trim().toUpperCase() : "ACTIVE");
        return sb.toString();
    }

    // CSV Paths
    private Path getCsvPath(String fileName) {
        Path candidate1 = Path.of("data-import/" + fileName).toAbsolutePath().normalize();
        if (Files.exists(candidate1)) {
            return candidate1;
        }
        return Path.of("../data-import/" + fileName).toAbsolutePath().normalize();
    }

    // CSV Sync: dictionary.csv
    private void syncDictionaryToCsv(Long id, String kanji, String hiragana) {
        Path path = getCsvPath("dictionary.csv");
        String newLine = String.format("\"%d\"|\"%s\"|\"%s\"", id, kanji, hiragana);
        updateCsvRow(path, id, newLine);
    }

    // CSV Sync: meaning.csv
    private void syncMeaningToCsv(Long id, Long wordId, String pos, String gloss, String xref) {
        Path path = getCsvPath("meaning.csv");
        String newLine = String.format("\"%d\"|\"%d\"|\"%s\"|\"%s\"|\"%s\"", id, wordId, pos != null ? pos : "", gloss, xref != null ? xref : "");
        updateCsvRow(path, id, newLine);
    }

    // CSV Sync: example.csv
    private void syncExampleToCsv(Long id, Long meaningId, String exText, String sentenceJp, String sentenceVi) {
        Path path = getCsvPath("example.csv");
        String newLine = String.format("\"%d\"|\"%d\"|\"%s\"|\"%s\"|\"%s\"", id, meaningId, exText, sentenceJp, sentenceVi != null ? sentenceVi : "");
        updateCsvRow(path, id, newLine);
    }

    // CSV helper: Update line by ID
    private synchronized void updateCsvRow(Path filePath, Long id, String newLineContent) {
        try {
            if (!Files.exists(filePath)) {
                log.warn("CSV file not found: {}", filePath);
                return;
            }
            List<String> lines = Files.readAllLines(filePath, java.nio.charset.StandardCharsets.UTF_8);
            String searchPrefix = "\"" + id + "\"|";
            boolean found = false;
            for (int i = 0; i < lines.size(); i++) {
                if (lines.get(i).startsWith(searchPrefix)) {
                    lines.set(i, newLineContent);
                    found = true;
                    break;
                }
            }
            if (found) {
                Files.write(filePath, lines, java.nio.charset.StandardCharsets.UTF_8);
                log.info("Updated CSV row for ID {} in {}", id, filePath.getFileName());
            } else {
                Files.writeString(filePath, newLineContent + "\n", java.nio.charset.StandardCharsets.UTF_8, java.nio.file.StandardOpenOption.APPEND);
                log.info("Appended new CSV row for ID {} in {}", id, filePath.getFileName());
            }
        } catch (Exception e) {
            log.error("Failed to update CSV row for ID " + id + " in " + filePath, e);
        }
    }

    // CSV helper: Delete line by ID
    private synchronized void deleteCsvRow(Path filePath, Long id) {
        try {
            if (!Files.exists(filePath)) {
                return;
            }
            List<String> lines = Files.readAllLines(filePath, java.nio.charset.StandardCharsets.UTF_8);
            String searchPrefix = "\"" + id + "\"|";
            boolean removed = lines.removeIf(line -> line.startsWith(searchPrefix));
            if (removed) {
                Files.write(filePath, lines, java.nio.charset.StandardCharsets.UTF_8);
                log.info("Deleted CSV row for ID {} in {}", id, filePath.getFileName());
            }
        } catch (Exception e) {
            log.error("Failed to delete CSV row for ID " + id + " in " + filePath, e);
        }
    }
}
