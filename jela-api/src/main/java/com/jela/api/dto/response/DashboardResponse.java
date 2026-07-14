package com.jela.api.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DashboardResponse {
    private Integer streakCount;
    private String streakStatus;
    private KanjiProgressDto kanjiProgress;
    private VocabProgressDto vocabProgress;
    private WordOfDayDto wordOfDay;
    private KanjiOfDayDto kanjiOfDay;
    private List<DeadlineItemDto> deadlines;
    private List<LearningModuleDto> learningModules;

    @Getter
    @Builder
    public static class KanjiProgressDto {
        private String level;
        private long learnedCount;
        private long totalCount;
        private int percentage;
    }

    @Getter
    @Builder
    public static class VocabProgressDto {
        private String level;
        private long learnedCount;
        private long totalCount;
        private int percentage;
    }

    @Getter
    @Builder
    public static class WordOfDayDto {
        private Long id;
        private String japanese;
        private String reading;
        private String meaning;
    }

    @Getter
    @Builder
    public static class KanjiOfDayDto {
        private Long id;
        private String character;
        private List<String> readingsOn;
        private List<String> readingsKun;
        private List<String> meanings;
    }

    @Getter
    @Builder
    public static class DeadlineItemDto {
        private Long listId;
        private String listName;
        private String type; // KANJI or VOCAB
        private long dueCount;
        private java.time.Instant earliestDueDate;
    }

    @Getter
    @Builder
    public static class LearningModuleDto {
        private String character;
        private String reading;
        private String title;
        private String description;
        private String duration;
        private String category;
        private String link;
        private long totalCount;
        private long newCount;
        private long masteredCount;
    }
}
