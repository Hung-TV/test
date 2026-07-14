package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminKanjiResponse(
        Long id,
        String character,
        String meaning,
        String onyomi,
        String kunyomi,
        String jlptLevel,
        Integer strokeCount,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
