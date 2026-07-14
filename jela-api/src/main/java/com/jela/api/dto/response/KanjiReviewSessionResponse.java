package com.jela.api.dto.response;

import java.util.List;

public record KanjiReviewSessionResponse(
        List<QuizQuestion> questions
) {
    public record QuizQuestion(
            Long kanjiId,
            String character,
            String questionType,
            String questionText,
            List<String> options,
            int correctIndex
    ) {}
}
