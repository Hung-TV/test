package com.jela.api.entity;

import com.jela.api.enums.KanjiListSourceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_kanji_list")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserKanjiList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "list_id")
    private Long listId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "list_name", nullable = false, length = 100)
    private String listName;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private KanjiListSourceType sourceType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (listName == null || listName.isBlank()) listName = "My Kanji List";
        if (sourceType == null) sourceType = KanjiListSourceType.CUSTOM;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
