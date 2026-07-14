package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record KanjiListLearnSummaryResponse(
        Long listId,
        String listName,
        String sourceType,
        Long totalCount,
        Long dueCount,
        Long masteredCount,
        Long newCount,
        Long learningCount,
        boolean completed,
        Instant updatedAt
) {
}
