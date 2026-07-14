package com.jela.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "kanji")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kanji_id")
    private Long kanjiId;

    @Column(name = "character", nullable = false, unique = true, length = 10)
    private String character;

    @Column(name = "reading")
    private String reading;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "meanings", columnDefinition = "text[]")
    private String[] meanings;

    @Column(name = "strokes")
    private Integer strokes;

    @Column(name = "radical")
    private String radical;

    @Column(name = "shape")
    private String shape;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "readings_on", columnDefinition = "text[]")
    private String[] readingsOn;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "readings_kun", columnDefinition = "text[]")
    private String[] readingsKun;

    @Column(name = "jlpt", length = 5)
    private String jlpt;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
