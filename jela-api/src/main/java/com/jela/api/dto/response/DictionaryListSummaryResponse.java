package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record DictionaryListSummaryResponse(
        Long id,
        String name,
        Long wordCount,
        Long dueCount,
        Long masteredCount,
        Long newCount,
        Long learningCount,
        boolean completed,
        Instant updatedAt
) {
}
