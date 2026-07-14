package com.jela.api.dto.response;

public record KanjiLevelResponse(
        String level,
        long totalKanji,
        long learnedKanji,
        boolean isUnlocked,
        Long listId
) {
}
