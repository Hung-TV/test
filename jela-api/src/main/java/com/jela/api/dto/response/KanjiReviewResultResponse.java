package com.jela.api.dto.response;

import java.time.Instant;
import java.util.List;

public record KanjiReviewResultResponse(
        String status,
        List<ReviewResult> results
) {
    public record ReviewResult(
            Long kanjiId,
            String newStatus,
            Instant nextReviewAt,
            int intervalDays
    ) {
    }
}
