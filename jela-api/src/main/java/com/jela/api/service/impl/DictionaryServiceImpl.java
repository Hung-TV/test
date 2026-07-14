package com.jela.api.service.impl;

import com.jela.api.dto.response.DictionaryDetailResponse;
import com.jela.api.dto.response.DictionarySearchResponse;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.DictionaryHistoryRepository;
import com.jela.api.repository.DictionaryRepository;
import com.jela.api.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DictionaryServiceImpl implements DictionaryService {

    private final DictionaryRepository dictionaryRepository;
    private final DictionaryHistoryRepository dictionaryHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DictionarySearchResponse> search(String searchKey) {
        if (searchKey == null || searchKey.isBlank()) {
            return List.of();
        }

        String trimmedKey = searchKey.trim();
        List<Long> ids = dictionaryRepository.findSearchResultIds(trimmedKey);

        if (ids.isEmpty()) {
            return List.of();
        }

        Map<Long, DictionarySearchBuilder> groupedResults = new LinkedHashMap<>();
        for (Long id : ids) {
            groupedResults.put(id, null);
        }

        for (var row : dictionaryRepository.findSearchRowsByIds(ids)) {
            DictionarySearchBuilder result = groupedResults.get(row.getId());
            if (result == null) {
                result = new DictionarySearchBuilder(row.getId(), row.getKanji(), row.getHiragana());
                groupedResults.put(row.getId(), result);
            }

            if (row.getMeaningId() != null) {
                result.meaning.add(DictionarySearchResponse.MeaningSummaryResponse.builder()
                        .meaningId(row.getMeaningId())
                        .gloss(row.getGloss())
                        .build());
            }
        }

        return groupedResults.values().stream()
                .filter(result -> result != null)
                .map(DictionarySearchBuilder::build)
                .toList();
    }

    @Override
    @Transactional
    public DictionaryDetailResponse searchId(Long userId, Long wordId) {
        List<DictionaryRepository.DictionaryDetailRow> rows = dictionaryRepository.findDetailRowsById(wordId);

        if (rows.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Dictionary entry not found");
        }

        if (userId != null) {
            dictionaryHistoryRepository.upsertHistory(userId, wordId);
        }

        DictionaryRepository.DictionaryDetailRow firstRow = rows.get(0);
        DictionaryDetailBuilder result = new DictionaryDetailBuilder(
                firstRow.getId(),
                firstRow.getKanji(),
                firstRow.getHiragana()
        );

        for (var row : rows) {
            if (row.getMeaningId() == null) {
                continue;
            }

            MeaningDetailBuilder meaning = result.meanings.get(row.getMeaningId());
            if (meaning == null) {
                meaning = new MeaningDetailBuilder(
                        row.getMeaningId(),
                        row.getPos(),
                        row.getGloss(),
                        row.getXref()
                );
                result.meanings.put(row.getMeaningId(), meaning);
            }

            if (row.getExId() != null) {
                meaning.examples.add(DictionaryDetailResponse.ExampleResponse.builder()
                        .exId(row.getExId())
                        .exTest(row.getExTest())
                        .sentenceJP(row.getSentenceJP())
                        .sentenceVI(row.getSentenceVI())
                        .build());
            }
        }

        return result.build();
    }

    private static class DictionarySearchBuilder {
        private final Long id;
        private final String kanji;
        private final String hiragana;
        private final List<DictionarySearchResponse.MeaningSummaryResponse> meaning = new ArrayList<>();

        private DictionarySearchBuilder(Long id, String kanji, String hiragana) {
            this.id = id;
            this.kanji = kanji;
            this.hiragana = hiragana;
        }

        private DictionarySearchResponse build() {
            return DictionarySearchResponse.builder()
                    .id(id)
                    .kanji(kanji)
                    .hiragana(hiragana)
                    .meaning(meaning)
                    .build();
        }
    }

    private static class DictionaryDetailBuilder {
        private final Long id;
        private final String kanji;
        private final String hiragana;
        private final Map<Long, MeaningDetailBuilder> meanings = new LinkedHashMap<>();

        private DictionaryDetailBuilder(Long id, String kanji, String hiragana) {
            this.id = id;
            this.kanji = kanji;
            this.hiragana = hiragana;
        }

        private DictionaryDetailResponse build() {
            return DictionaryDetailResponse.builder()
                    .id(id)
                    .kanji(kanji)
                    .hiragana(hiragana)
                    .meaning(meanings.values().stream()
                            .map(MeaningDetailBuilder::build)
                            .toList())
                    .build();
        }
    }

    private static class MeaningDetailBuilder {
        private final Long meaningId;
        private final String pos;
        private final String gloss;
        private final String xref;
        private final List<DictionaryDetailResponse.ExampleResponse> examples = new ArrayList<>();

        private MeaningDetailBuilder(Long meaningId, String pos, String gloss, String xref) {
            this.meaningId = meaningId;
            this.pos = pos;
            this.gloss = gloss;
            this.xref = xref;
        }

        private DictionaryDetailResponse.MeaningDetailResponse build() {
            return DictionaryDetailResponse.MeaningDetailResponse.builder()
                    .meaningId(meaningId)
                    .pos(pos)
                    .gloss(gloss)
                    .xref(xref)
                    .example(examples)
                    .build();
        }
    }
}
