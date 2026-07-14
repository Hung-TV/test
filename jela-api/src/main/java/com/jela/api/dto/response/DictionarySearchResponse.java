package com.jela.api.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record DictionarySearchResponse(
        Long id,
        String kanji,
        String hiragana,
        List<MeaningSummaryResponse> meaning
) {
    @Builder
    public record MeaningSummaryResponse(
            Long meaningId,
            String gloss
    ) {}
}
