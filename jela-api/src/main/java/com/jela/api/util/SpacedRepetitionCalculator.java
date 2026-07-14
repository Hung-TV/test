package com.jela.api.util;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class SpacedRepetitionCalculator {
    public static final int[] EBBINGHAUS_INTERVALS = {1, 3, 7, 14, 21, 60};
    public static final int MAX_STEP = EBBINGHAUS_INTERVALS.length - 1;

    public record SRSResult(
        int newStep,
        int newRepetitions,
        Instant nextReviewAt,
        String status
    ) {}

    /**
     * Calculates the next spaced repetition state based on the Ebbinghaus algorithm.
     * 
     * @param currentStep Current Ebbinghaus step (0 to 5)
     * @param repetitions Consecutive correct repetitions count
     * @param quality User rating quality (1 = Again/Fail, 2 = Hard, 3 = Good)
     * @param now Current timestamp
     * @return The updated SRSResult with step, reps, next review date, and status
     */
    public static SRSResult calculateNext(int currentStep, int repetitions, int quality, Instant now) {
        int step = currentStep;
        int reps = repetitions;

        switch (quality) {
            case 1 -> step = Math.max(step - 1, 0); // Drop 1 step on fail/again
            case 2 -> reps++;                       // Hard: keep step, increment reps
            case 3 -> {                             // Good: step up, increment reps
                step = Math.min(step + 1, MAX_STEP);
                reps++;
            }
            default -> throw new IllegalArgumentException("Invalid review quality value: " + quality);
        }

        int intervalDays = EBBINGHAUS_INTERVALS[step];
        Instant nextReview = now.plus(intervalDays, ChronoUnit.DAYS);

        String newStatus;
        if (step == 0) {
            newStatus = "LEARNING";
        } else if (step >= MAX_STEP && reps >= 5) {
            newStatus = "MASTERED";
        } else {
            newStatus = "REVIEWING";
        }

        return new SRSResult(step, reps, nextReview, newStatus);
    }
}
