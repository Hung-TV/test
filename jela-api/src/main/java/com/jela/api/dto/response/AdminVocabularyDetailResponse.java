package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminVocabularyDetailResponse(
        Long id,
        String word,
        String kana,
        String meaning,
        String jlptLevel,
        String partOfSpeech,
        String exampleJapanese,
        String exampleVietnamese,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
