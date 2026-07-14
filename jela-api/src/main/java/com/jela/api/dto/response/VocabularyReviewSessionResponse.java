package com.jela.api.dto.response;

import java.util.List;

public record VocabularyReviewSessionResponse(
        List<QuizQuestion> questions
) {
    public record QuizQuestion(
            Long dictionaryId,
            String word,
            String hiragana,
            String questionType,
            String questionText,
            List<String> options,
            int correctIndex,
            String character
    ) {}
}
