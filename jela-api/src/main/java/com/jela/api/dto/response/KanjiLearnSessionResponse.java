package com.jela.api.dto.response;

import java.util.List;

public record KanjiLearnSessionResponse(
        String sessionType,
        int reviewCount,
        int newCount,
        List<LearnItem> items,
        List<KanjiReviewSessionResponse.QuizQuestion> questions
) {
    public record LearnItem(
            Long id,
            String character,
            List<String> onyomi,
            List<String> kunyomi,
            String meaning,
            String reading,
            Integer strokeCount,
            boolean isReview
    ) {
    }
}
