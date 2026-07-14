package com.jela.api.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record DictionaryDetailResponse(
        Long id,
        String kanji,
        String hiragana,
        List<MeaningDetailResponse> meaning
) {
    @Builder
    public record MeaningDetailResponse(
            Long meaningId,
            String pos,
            String gloss,
            String xref,
            List<ExampleResponse> example
    ) {}

    @Builder
    public record ExampleResponse(
            Long exId,
            String exTest,
            String sentenceJP,
            String sentenceVI
    ) {}
}
