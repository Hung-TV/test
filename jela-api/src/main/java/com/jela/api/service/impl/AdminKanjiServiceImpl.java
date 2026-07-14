package com.jela.api.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jela.api.dto.request.*;
import com.jela.api.dto.response.*;
import com.jela.api.entity.Kanji;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.KanjiRepository;
import com.jela.api.service.AdminKanjiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
public class AdminKanjiServiceImpl implements AdminKanjiService {

    private final KanjiRepository kanjiRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminKanjiListResponse getKanjiList(
            String keyword,
            String level,
            String status,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    ) {
        String dbLevel = level != null && !level.equalsIgnoreCase("ALL") ? level.toUpperCase() : null;
        String dbStatus = status != null && !status.equalsIgnoreCase("ALL") ? status.toUpperCase() : null;

        // Map sorting field from entity properties to database columns
        String sortColumn = "updated_at";
        if (sortBy != null) {
            switch (sortBy) {
                case "character" -> sortColumn = "character";
                case "meaning" -> sortColumn = "reading"; // meaning maps to reading in DB
                case "jlptLevel" -> sortColumn = "jlpt";
                case "strokeCount" -> sortColumn = "strokes";
                case "updatedAt" -> sortColumn = "updated_at";
                case "createdAt" -> sortColumn = "created_at";
            }
        }

        Sort.Direction direction = Sort.Direction.DESC;
        if (sortOrder != null && sortOrder.equalsIgnoreCase("asc")) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, sortColumn));
        Page<Kanji> kanjiPage = kanjiRepository.findAllForAdmin(keyword, dbLevel, dbStatus, pageable);

        List<AdminKanjiResponse> items = kanjiPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        AdminKanjiListResponse.PaginationResponse pagination = AdminKanjiListResponse.PaginationResponse.builder()
                .page(page)
                .limit(limit)
                .totalItems(kanjiPage.getTotalElements())
                .totalPages(kanjiPage.getTotalPages())
                .build();

        return AdminKanjiListResponse.builder()
                .items(items)
                .pagination(pagination)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminKanjiDetailResponse getKanjiById(Long id) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy Kanji với ID: " + id));
        return mapToDetailResponse(kanji);
    }

    @Override
    public AdminKanjiDetailResponse createKanji(AdminCreateKanjiRequest request) {
        if (kanjiRepository.existsByCharacter(request.getCharacter())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chữ Kanji này đã tồn tại trên hệ thống");
        }

        // Pack metadata (example, mnemonic) into existing meanings TEXT[] column
        List<String> meaningsList = new ArrayList<>();
        if (request.getExampleJapanese() != null && !request.getExampleJapanese().isBlank()) {
            meaningsList.add("EX_JP:" + request.getExampleJapanese().trim());
        }
        if (request.getExampleVietnamese() != null && !request.getExampleVietnamese().isBlank()) {
            meaningsList.add("EX_VI:" + request.getExampleVietnamese().trim());
        }
        if (request.getMnemonic() != null && !request.getMnemonic().isBlank()) {
            meaningsList.add("MN:" + request.getMnemonic().trim());
        }

        Kanji kanji = Kanji.builder()
                .character(request.getCharacter().trim())
                .reading(request.getMeaning().trim()) // mapping: meaning -> reading column
                .readingsOn(parseReadings(request.getOnyomi()))
                .readingsKun(parseReadings(request.getKunyomi()))
                .jlpt(request.getJlptLevel().trim().toUpperCase())
                .strokes(request.getStrokeCount())
                .radical(request.getRadical() != null ? request.getRadical().trim() : null)
                .meanings(meaningsList.toArray(new String[0])) // Pack here
                .status(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "ACTIVE")
                .build();

        kanji = kanjiRepository.save(kanji);

        // Sync to JSON file
        appendOrUpdateKanjiInJsonFile(kanji);

        return mapToDetailResponse(kanji);
    }

    @Override
    public AdminKanjiDetailResponse updateKanji(Long id, AdminUpdateKanjiRequest request) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy Kanji với ID: " + id));

        if (kanjiRepository.existsByCharacterAndKanjiIdNot(request.getCharacter(), id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chữ Kanji này đã tồn tại trên hệ thống");
        }

        // Pack metadata (example, mnemonic) into existing meanings TEXT[] column
        List<String> meaningsList = new ArrayList<>();
        if (request.getExampleJapanese() != null && !request.getExampleJapanese().isBlank()) {
            meaningsList.add("EX_JP:" + request.getExampleJapanese().trim());
        }
        if (request.getExampleVietnamese() != null && !request.getExampleVietnamese().isBlank()) {
            meaningsList.add("EX_VI:" + request.getExampleVietnamese().trim());
        }
        if (request.getMnemonic() != null && !request.getMnemonic().isBlank()) {
            meaningsList.add("MN:" + request.getMnemonic().trim());
        }

        kanji.setCharacter(request.getCharacter().trim());
        kanji.setReading(request.getMeaning().trim());
        kanji.setReadingsOn(parseReadings(request.getOnyomi()));
        kanji.setReadingsKun(parseReadings(request.getKunyomi()));
        kanji.setJlpt(request.getJlptLevel().trim().toUpperCase());
        kanji.setStrokes(request.getStrokeCount());
        kanji.setRadical(request.getRadical() != null ? request.getRadical().trim() : null);
        kanji.setMeanings(meaningsList.toArray(new String[0])); // Pack here
        if (request.getStatus() != null) {
            kanji.setStatus(request.getStatus().trim().toUpperCase());
        }

        kanji = kanjiRepository.save(kanji);

        // Sync to JSON file
        appendOrUpdateKanjiInJsonFile(kanji);

        return mapToDetailResponse(kanji);
    }

    @Override
    public AdminKanjiDetailResponse updateKanjiStatus(Long id, AdminUpdateKanjiStatusRequest request) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy Kanji với ID: " + id));

        String newStatus = request.getStatus().trim().toUpperCase();
        if (!newStatus.equals("ACTIVE") && !newStatus.equals("HIDDEN")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }

        kanji.setStatus(newStatus);
        kanji = kanjiRepository.save(kanji);

        // Sync to JSON file
        appendOrUpdateKanjiInJsonFile(kanji);

        return mapToDetailResponse(kanji);
    }

    @Override
    public void deleteKanji(Long id) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy Kanji với ID: " + id));

        String character = kanji.getCharacter();
        kanjiRepository.delete(kanji);

        // Sync to JSON file
        removeKanjiFromJsonFile(character);
    }

    // Helper: Map entity to response DTO
    private AdminKanjiResponse mapToResponse(Kanji kanji) {
        return AdminKanjiResponse.builder()
                .id(kanji.getKanjiId())
                .character(kanji.getCharacter())
                .meaning(kanji.getReading()) // reading column -> meaning field
                .onyomi(kanji.getReadingsOn() != null ? String.join(", ", kanji.getReadingsOn()) : "")
                .kunyomi(kanji.getReadingsKun() != null ? String.join(", ", kanji.getReadingsKun()) : "")
                .jlptLevel(kanji.getJlpt())
                .strokeCount(kanji.getStrokes())
                .status(kanji.getStatus())
                .createdAt(kanji.getCreatedAt())
                .updatedAt(kanji.getUpdatedAt())
                .build();
    }

    // Helper: Map entity to detailed response DTO
    private AdminKanjiDetailResponse mapToDetailResponse(Kanji kanji) {
        String exampleJapanese = "";
        String exampleVietnamese = "";
        String mnemonic = "";

        if (kanji.getMeanings() != null) {
            for (String m : kanji.getMeanings()) {
                if (m.startsWith("EX_JP:")) {
                    exampleJapanese = m.substring(6);
                } else if (m.startsWith("EX_VI:")) {
                    exampleVietnamese = m.substring(6);
                } else if (m.startsWith("MN:")) {
                    mnemonic = m.substring(3);
                }
            }
        }

        return AdminKanjiDetailResponse.builder()
                .id(kanji.getKanjiId())
                .character(kanji.getCharacter())
                .meaning(kanji.getReading())
                .onyomi(kanji.getReadingsOn() != null ? String.join(", ", kanji.getReadingsOn()) : "")
                .kunyomi(kanji.getReadingsKun() != null ? String.join(", ", kanji.getReadingsKun()) : "")
                .jlptLevel(kanji.getJlpt())
                .strokeCount(kanji.getStrokes())
                .radical(kanji.getRadical())
                .exampleJapanese(exampleJapanese)
                .exampleVietnamese(exampleVietnamese)
                .mnemonic(mnemonic)
                .status(kanji.getStatus())
                .createdAt(kanji.getCreatedAt())
                .updatedAt(kanji.getUpdatedAt())
                .build();
    }

    // Helper: Parse readings string separated by commas
    private String[] parseReadings(String input) {
        if (input == null || input.isBlank()) {
            return new String[0];
        }
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    // JSON Sync: Resolve Path to JSON file
    private Path getKanjiJsonPath() {
        Path candidate1 = Path.of("data-import/kanji_bank_jlpt.json").toAbsolutePath().normalize();
        if (Files.exists(candidate1)) {
            return candidate1;
        }
        return Path.of("../data-import/kanji_bank_jlpt.json").toAbsolutePath().normalize();
    }

    // JSON Sync: Add or Update Kanji Entry in data-import JSON
    private synchronized void appendOrUpdateKanjiInJsonFile(Kanji kanji) {
        try {
            Path filePath = getKanjiJsonPath();
            if (!Files.exists(filePath)) {
                log.warn("Kanji bank JSON file not found at: {}", filePath);
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            List<List<Object>> list;
            try {
                list = mapper.readValue(filePath.toFile(), new TypeReference<List<List<Object>>>() {});
            } catch (Exception e) {
                list = new ArrayList<>();
            }

            // Remove existing entry if duplicate character
            list.removeIf(entry -> !entry.isEmpty() && entry.get(0).equals(kanji.getCharacter()));

            // Build entry array: ["character", "reading (meaning)", "", "", ["meaning1"], attrsMap]
            List<Object> entry = new ArrayList<>();
            entry.add(kanji.getCharacter());
            entry.add(kanji.getReading() != null ? kanji.getReading() : "");
            entry.add("");
            entry.add("");
            
            // meanings is parsed array. Pack original reading and meanings array (EX_JP, EX_VI, MN) together
            List<String> meaningsList = new ArrayList<>();
            if (kanji.getReading() != null && !kanji.getReading().isBlank()) {
                meaningsList.add(kanji.getReading());
            }
            if (kanji.getMeanings() != null) {
                meaningsList.addAll(Arrays.asList(kanji.getMeanings()));
            }
            entry.add(meaningsList);

            Map<String, Object> attrs = new LinkedHashMap<>();
            attrs.put("Strokes", kanji.getStrokes() != null ? String.valueOf(kanji.getStrokes()) : "");
            attrs.put("Radical", kanji.getRadical() != null ? kanji.getRadical() : "");
            attrs.put("Shape", ""); // Leave shape empty or default
            
            String unicodeStr = "";
            if (kanji.getCharacter() != null && !kanji.getCharacter().isEmpty()) {
                int codePoint = kanji.getCharacter().codePointAt(0);
                unicodeStr = "U+" + Integer.toHexString(codePoint).toUpperCase();
            }
            attrs.put("Unicode", unicodeStr);
            attrs.put("jlpt", kanji.getJlpt() != null ? kanji.getJlpt() : "");
            attrs.put("readings_on", kanji.getReadingsOn() != null ? Arrays.asList(kanji.getReadingsOn()) : Collections.emptyList());
            attrs.put("readings_kun", kanji.getReadingsKun() != null ? Arrays.asList(kanji.getReadingsKun()) : Collections.emptyList());

            entry.add(attrs);

            // Insert at the beginning
            list.add(0, entry);

            // Write back to file
            mapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), list);
            log.info("Synced Kanji {} successfully to data-import JSON file: {}", kanji.getCharacter(), filePath);

        } catch (Exception e) {
            log.error("Failed to sync created/updated Kanji to JSON file", e);
        }
    }

    // JSON Sync: Remove Kanji Entry from data-import JSON
    private synchronized void removeKanjiFromJsonFile(String character) {
        try {
            Path filePath = getKanjiJsonPath();
            if (!Files.exists(filePath)) {
                log.warn("Kanji bank JSON file not found at: {}", filePath);
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            List<List<Object>> list;
            try {
                list = mapper.readValue(filePath.toFile(), new TypeReference<List<List<Object>>>() {});
            } catch (Exception e) {
                return;
            }

            boolean removed = list.removeIf(entry -> !entry.isEmpty() && entry.get(0).equals(character));
            if (removed) {
                mapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), list);
                log.info("Deleted Kanji {} from data-import JSON file successfully.", character);
            }
        } catch (Exception e) {
            log.error("Failed to remove deleted Kanji from JSON file", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkKanjiExists(String character) {
        if (character == null || character.isBlank()) {
            return Map.of("exists", false);
        }
        Optional<Kanji> existingOpt = kanjiRepository.findByCharacter(character.trim());
        if (existingOpt.isPresent()) {
            Kanji k = existingOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("exists", true);
            res.put("character", k.getCharacter());
            res.put("meaning", k.getReading() != null ? k.getReading() : "");
            res.put("jlpt", k.getJlpt() != null ? k.getJlpt() : "");
            return res;
        }
        return Map.of("exists", false);
    }
}
