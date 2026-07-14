package com.jela.api.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record DictionaryHistoryResponse(
        List<HistoryWordResponse> hisWordList,
        long totalRecords,
        int totalPages
) {
    public record HistoryWordResponse(
            Long id,
            String kanji,
            LocalDateTime searchedAt
    ) {
    }
}
