package com.jela.api.dto.response;

import lombok.Builder;

@Builder
public record AdminLearningProgressResponse(
        int kanji,
        int vocabulary,
        int quizzes,
        double averageScore,
        double completionRate
) {}
