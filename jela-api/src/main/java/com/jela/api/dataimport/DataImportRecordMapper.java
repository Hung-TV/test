package com.jela.api.dataimport;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.csv.CSVRecord;

import java.util.ArrayList;
import java.util.List;

final class DataImportRecordMapper {

    private DataImportRecordMapper() {
    }

    static DictionaryRow toDictionaryRow(CSVRecord record) {
        return new DictionaryRow(
                parseLong(record, "id"),
                value(record, "kanji"),
                value(record, "hiragana")
        );
    }

    static MeaningRow toMeaningRow(CSVRecord record) {
        return new MeaningRow(
                parseLong(record, "id"),
                parseLong(record, "word_id"),
                value(record, "pos"),
                value(record, "gloss"),
                value(record, "xref")
        );
    }

    static ExampleRow toExampleRow(CSVRecord record) {
        return new ExampleRow(
                parseLong(record, "id"),
                parseLong(record, "meaning_id"),
                value(record, "ex_text"),
                value(record, "sentence_jp"),
                value(record, "sentence_vi")
        );
    }

    static KanjiRow toKanjiRow(JsonNode entry) {
        if (!entry.isArray() || entry.size() < 6) {
            throw new IllegalArgumentException("Invalid kanji entry at JSON node: " + entry);
        }

        JsonNode attrs = entry.get(5);
        if (attrs == null || !attrs.isObject()) {
            throw new IllegalArgumentException("Invalid kanji attrs at JSON node: " + entry);
        }

        return new KanjiRow(
                textOrNull(entry.get(0)),
                formatSinoVietnamese(textOrNull(entry.get(1))),
                stringArray(entry.get(4)),
                parseInteger(textOrNull(attrs.get("Strokes"))),
                textOrNull(attrs.get("Radical")),
                textOrNull(attrs.get("Shape")),
                stringArray(attrs.get("readings_on")),
                stringArray(attrs.get("readings_kun")),
                textOrNull(attrs.get("jlpt"))
        );
    }

    private static long parseLong(CSVRecord record, String fieldName) {
        String raw = value(record, fieldName);
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Missing numeric CSV field: " + fieldName);
        }
        return Long.parseLong(raw);
    }

    private static Integer parseInteger(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return raw.chars().allMatch(Character::isDigit) ? Integer.valueOf(raw) : null;
    }

    private static String value(CSVRecord record, String fieldName) {
        return record.isMapped(fieldName) ? record.get(fieldName) : null;
    }

    private static String textOrNull(JsonNode node) {
        return node == null || node.isNull() ? null : node.asText();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String[] stringArray(JsonNode node) {
        if (node == null || !node.isArray()) {
            return new String[0];
        }

        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            values.add(item.asText());
        }
        return values.toArray(String[]::new);
    }

    private static String formatSinoVietnamese(String reading) {
        if (reading == null || reading.isBlank()) return null;
        return java.util.Arrays.stream(reading.trim().split("\\s+"))
                .map(String::toUpperCase)
                .collect(java.util.stream.Collectors.joining(", "));
    }

    record DictionaryRow(long dictionaryId, String kanji, String hiragana) {
    }

    record MeaningRow(long meaningId, long dictionaryId, String pos, String gloss, String xref) {
    }

    record ExampleRow(long exampleId, long meaningId, String exText, String sentenceJp, String sentenceVi) {
    }

    record KanjiRow(
            String character,
            String reading,
            String[] meanings,
            Integer strokes,
            String radical,
            String shape,
            String[] readingsOn,
            String[] readingsKun,
            String jlpt
    ) {
    }
}
