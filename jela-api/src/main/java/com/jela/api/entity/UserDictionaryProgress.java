package com.jela.api.entity;

import com.jela.api.enums.VocabularyLearningStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_dictionary_progress")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDictionaryProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long progressId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dictionary_id", nullable = false)
    private Dictionary dictionary;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VocabularyLearningStatus status;

    /**
     * Ebbinghaus step index 0-5 corresponding to intervals [1,3,7,14,21,60] days
     */
    @Column(name = "current_step", nullable = false)
    private Integer currentStep;

    @Column(name = "repetitions", nullable = false)
    private Integer repetitions;

    /** Last review quality: 1=Again, 2=Hard, 3=Good */
    @Column(name = "last_quality")
    private Integer lastQuality;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @Column(name = "next_review_at")
    private Instant nextReviewAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = VocabularyLearningStatus.NEW;
        if (currentStep == null) currentStep = 0;
        if (repetitions == null) repetitions = 0;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
