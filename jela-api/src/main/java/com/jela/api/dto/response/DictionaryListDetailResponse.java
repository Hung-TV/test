package com.jela.api.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public record DictionaryListDetailResponse(
        Long listId,
        String listName,
        List<WordSummary> words,
        long totalRecords,
        int totalPages
) {
    @Builder
    public record WordSummary(
            Long id,
            String kanji,
            String hiragana
    ) {}
}
