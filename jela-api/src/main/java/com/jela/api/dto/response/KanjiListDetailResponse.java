package com.jela.api.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public record KanjiListDetailResponse(
        Long listId,
        String listName,
        List<KanjiSummary> kanjis,
        long totalRecords,
        int totalPages
) {
    public record KanjiSummary(
            Long id,
            String character
    ) {}
}
