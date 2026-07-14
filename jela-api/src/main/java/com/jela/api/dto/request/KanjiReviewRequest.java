package com.jela.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class KanjiReviewRequest {

    @NotNull
    @Valid
    private List<ReviewItem> reviews;

    @Data
    public static class ReviewItem {
        @NotNull
        private Long kanjiId;

        /** 1=Again, 2=Hard, 3=Good */
        @NotNull
        @Min(1)
        @Max(3)
        private Integer quality;
    }
}
