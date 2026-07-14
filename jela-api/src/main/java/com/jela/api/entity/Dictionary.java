package com.jela.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "dictionary")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dictionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dictionary_id")
    private Long dictionaryId;

    @Column(name = "kanji")
    private String kanji;

    @Column(name = "hiragana")
    private String hiragana;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
