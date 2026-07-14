package com.jela.api.dto.response;

import lombok.Builder;

@Builder
public record KanjiListSummaryResponse(
        Long id,
        String name,
        String sourceType,
        Long kanjiCount
) {
}
