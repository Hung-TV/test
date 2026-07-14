package com.jela.api.dto.response;

import lombok.Builder;

@Builder
public record KanjiLearningListResponse(
        Long listId,
        String listName,
        String sourceType,
        Long kanjiCount
) {
}
