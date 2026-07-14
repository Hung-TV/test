package com.jela.api.entity;

import com.jela.api.enums.KanjiLearningStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_kanji_list_item")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserKanjiListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private UserKanjiList list;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id", nullable = false)
    private Kanji kanji;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private KanjiLearningStatus status;

    @Column(name = "added_at", nullable = false)
    private Instant addedAt;

    @Column(name = "learned_at")
    private Instant learnedAt;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "note")
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (addedAt == null) addedAt = now;
        if (status == null) status = KanjiLearningStatus.NEW;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
