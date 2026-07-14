package com.jela.api.dto.response;

import java.time.Instant;
import java.util.List;

public record VocabularyReviewResultResponse(
        String status,
        List<ReviewResult> results
) {
    public record ReviewResult(
            Long dictionaryId,
            String newStatus,
            Instant nextReviewAt,
            int intervalDays
    ) {}
}
