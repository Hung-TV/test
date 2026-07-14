package com.jela.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "dictionary_history")
@IdClass(DictionaryHistoryId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DictionaryHistory {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "dictionary_id")
    private Long dictionaryId;

    @Column(name = "searched_at", nullable = false)
    private Instant searchedAt;
}
