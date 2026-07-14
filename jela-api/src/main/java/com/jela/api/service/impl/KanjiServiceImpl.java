package com.jela.api.service.impl;

import com.jela.api.dto.response.KanjiDetailResponse;
import com.jela.api.dto.response.KanjiLevelResponse;
import com.jela.api.dto.response.KanjiSearchResponse;
import com.jela.api.dto.response.KanjiSummaryResponse;
import com.jela.api.entity.Kanji;
import com.jela.api.enums.KanjiLearningStatus;
import com.jela.api.exception.ApiException;
import com.jela.api.enums.KanjiListSourceType;
import com.jela.api.repository.DictionaryRepository;
import com.jela.api.repository.KanjiHistoryRepository;
import com.jela.api.repository.KanjiRepository;
import com.jela.api.repository.UserKanjiListRepository;
import com.jela.api.repository.UserKanjiProgressRepository;
import com.jela.api.service.KanjiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KanjiServiceImpl implements KanjiService {

    private static final List<String> JLPT_LEVELS = List.of("N5", "N4", "N3", "N2", "N1");
    private static final int KANJI_LEVEL_PAGE_SIZE = 10;
    private static final int KANJI_EXAMPLE_WORD_LIMIT = 5;
    private static final String READING_DELIMITER = "\u001F";
    private static final List<KanjiLearningStatus> LEARNED_STATUSES =
            List.of(KanjiLearningStatus.LEARNING, KanjiLearningStatus.REVIEWING, KanjiLearningStatus.MASTERED);

    private final KanjiRepository kanjiRepository;
    private final KanjiHistoryRepository kanjiHistoryRepository;
    private final UserKanjiProgressRepository progressRepository;
    private final DictionaryRepository dictionaryRepository;
    private final UserKanjiListRepository userKanjiListRepository;

    @Override
    @Transactional(readOnly = true)
    public List<KanjiLevelResponse> getLevels(Long userId) {
        return JLPT_LEVELS.stream().map(level -> {
            long total = kanjiRepository.countByJlpt(level);
            long learned = userId == null ? 0L :
                    progressRepository.countByUserIdAndKanjiJlptAndStatusIn(userId, level, LEARNED_STATUSES);
            Long listId = null;
            if (userId != null) {
                String listName = "JLPT " + level;
                listId = userKanjiListRepository
                        .findByUserUserIdAndSourceTypeAndListName(userId, KanjiListSourceType.JLPT_LEVEL, listName)
                        .map(l -> l.getListId())
                        .orElse(null);
            }
            return new KanjiLevelResponse(level, total, learned, true, listId);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KanjiSummaryResponse> getKanjiByLevel(String level, int page) {
        validateLevel(level);
        if (page < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Page must be positive");
        }
        Pageable pageable = PageRequest.of(page - 1, KANJI_LEVEL_PAGE_SIZE);
        Page<Kanji> kanjiPage = kanjiRepository.findByJlpt(level, pageable);

        List<KanjiSummaryResponse> content = kanjiPage.getContent().stream()
                .map(kanji -> new KanjiSummaryResponse(
                        kanji.getKanjiId(),
                        kanji.getCharacter(),
                        buildMeaning(kanji.getMeanings()),
                        kanji.getStrokes(),
                        formatReading(kanji.getReading())
                ))
                .toList();

        return new PageImpl<>(content, pageable, kanjiPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<KanjiSearchResponse> search(String searchKey) {
        if (searchKey == null || searchKey.isBlank()) return List.of();
        List<Long> ids = kanjiRepository.findSearchResultIds(searchKey.trim());
        if (ids.isEmpty()) return List.of();

        Map<Long, Kanji> kanjiMap = kanjiRepository.findAllByIdIn(ids).stream()
                .collect(Collectors.toMap(Kanji::getKanjiId, kanji -> kanji));

        return ids.stream()
                .map(kanjiMap::get)
                .filter(Objects::nonNull)
                .map(kanji -> new KanjiSearchResponse(
                        kanji.getKanjiId(),
                        kanji.getCharacter(),
                        buildMeaning(kanji.getMeanings()),
                        kanji.getJlpt(),
                        formatReading(kanji.getReading())
                ))
                .toList();
    }

    @Override
    @Transactional
    public KanjiDetailResponse getDetail(Long kanjiId, Long userId) {
        Kanji kanji = kanjiRepository.findById(kanjiId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Kanji not found"));

        if (userId != null) {
            kanjiHistoryRepository.upsertHistory(userId, kanjiId);
        }

        return new KanjiDetailResponse(
                kanji.getKanjiId(),
                kanji.getCharacter(),
                kanji.getJlpt(),
                arrayToList(kanji.getReadingsOn()),
                arrayToList(kanji.getReadingsKun()),
                formatReading(kanji.getReading()),
                buildMeaning(kanji.getMeanings()),
                kanji.getStrokes(),
                kanji.getRadical(),
                buildExampleWords(kanji.getCharacter(), kanji.getReadingsOn()),
                buildExampleWords(kanji.getCharacter(), kanji.getReadingsKun())
        );
    }

    private List<KanjiDetailResponse.ExampleWordResponse> buildExampleWords(String character, String[] readings) {
        if (character == null || character.isBlank()) {
            return List.of();
        }

        List<String> normalizedReadings = normalizeReadings(readings);
        if (normalizedReadings.isEmpty()) {
            return List.of();
        }

        String readingsParam = String.join(READING_DELIMITER, normalizedReadings);
        Map<Long, KanjiDetailResponse.ExampleWordResponse> wordsById = new LinkedHashMap<>();
        List<DictionaryRepository.KanjiExampleWordRow> rows =
                dictionaryRepository.findKanjiExampleWordsByReadings(
                        character,
                        readingsParam,
                        KANJI_EXAMPLE_WORD_LIMIT);

        for (var row : rows) {
            if (wordsById.size() >= KANJI_EXAMPLE_WORD_LIMIT) {
                break;
            }
            if (row.getId() == null || wordsById.containsKey(row.getId())) {
                continue;
            }
            wordsById.put(row.getId(), new KanjiDetailResponse.ExampleWordResponse(
                    row.getId(),
                    row.getWord(),
                    row.getHiragana(),
                    row.getMeaning()
            ));
        }

        return new ArrayList<>(wordsById.values());
    }

    private List<String> normalizeReadings(String[] readings) {
        if (readings == null || readings.length == 0) {
            return List.of();
        }

        return Arrays.stream(readings)
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(reading -> reading.replace(".", "").replace("-", ""))
                .filter(reading -> !reading.isBlank())
                .distinct()
                .toList();
    }

    private List<String> arrayToList(String[] arr) {
        return arr == null ? List.of() : Arrays.asList(arr);
    }

    private String buildMeaning(String[] meanings) {
        if (meanings == null || meanings.length == 0) return "";
        return String.join("; ", meanings);
    }

    private String formatReading(String reading) {
        if (reading == null || reading.isBlank()) return "";
        return Arrays.stream(reading.trim().split("[\\s,]+"))
                .map(String::toUpperCase)
                .collect(Collectors.joining(", "));
    }

    private void validateLevel(String level) {
        if (!JLPT_LEVELS.contains(level)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Invalid JLPT level: " + level + ". Must be one of: " + JLPT_LEVELS);
        }
    }
}
