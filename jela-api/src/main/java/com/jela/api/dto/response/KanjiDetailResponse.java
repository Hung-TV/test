package com.jela.api.dto.response;

import java.util.List;

public record KanjiDetailResponse(
        Long id,
        String character,
        String level,
        List<String> onyomi,
        List<String> kunyomi,
        String reading,
        String meaning,
        Integer strokeCount,
        String radical,
        List<ExampleWordResponse> on,
        List<ExampleWordResponse> kun
) {
    public record ExampleWordResponse(
            Long id,
            String word,
            String hiragana,
            String meaning
    ) {
    }
}
