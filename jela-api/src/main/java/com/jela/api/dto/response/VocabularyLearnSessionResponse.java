package com.jela.api.dto.response;

import java.util.List;

public record VocabularyLearnSessionResponse(
        String sessionType,
        int reviewCount,
        int newCount,
        List<LearnItem> items,
        List<VocabularyReviewSessionResponse.QuizQuestion> questions
) {
    public record LearnItem(
            Long id,
            String kanji,
            String hiragana,
            List<DictionaryDetailResponse.MeaningDetailResponse> meanings,
            boolean isReview
    ) {}
}
