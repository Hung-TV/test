package com.jela.api.dto.response;

public record KanjiSearchResponse(
        Long id,
        String character,
        String meaning,
        String level,
        String reading
) {
}
