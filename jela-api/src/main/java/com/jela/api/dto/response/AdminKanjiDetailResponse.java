package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminKanjiDetailResponse(
        Long id,
        String character,
        String meaning,
        String onyomi,
        String kunyomi,
        String jlptLevel,
        Integer strokeCount,
        String radical,
        String exampleJapanese,
        String exampleVietnamese,
        String mnemonic,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
