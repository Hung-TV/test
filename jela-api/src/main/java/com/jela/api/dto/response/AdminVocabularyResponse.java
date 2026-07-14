package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminVocabularyResponse(
        Long id,
        String word,
        String kana,
        String meaning,
        String jlptLevel,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
