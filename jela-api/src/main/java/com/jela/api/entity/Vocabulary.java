package com.jela.api.entity;

import com.jela.api.enums.Level;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vocabularies")
@Getter
@Setter
public class Vocabulary {
    @Id
    private Long id;

    @Column(nullable = false)
    private String word;

    @Column(nullable = false)
    private String meaning;

    private String reading;

    @Enumerated(EnumType.STRING)
    private Level level;
}
