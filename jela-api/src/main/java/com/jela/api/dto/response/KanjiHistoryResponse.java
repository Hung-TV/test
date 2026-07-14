package com.jela.api.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record KanjiHistoryResponse(
        List<HistoryKanjiResponse> hisKanjiList,
        long totalRecords,
        int totalPages
) {
    public record HistoryKanjiResponse(
            Long id,
            String character,
            LocalDateTime searchedAt
    ) {
    }
}
