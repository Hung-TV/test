package com.jela.api.dto.response;

public record KanjiSummaryResponse(
        Long id,
        String character,
        String meaning,
        Integer strokeCount,
        String reading
) {
}
