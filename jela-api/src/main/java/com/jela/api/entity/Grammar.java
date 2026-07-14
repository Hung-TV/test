package com.jela.api.entity;

import com.jela.api.enums.Level;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "grammars")
@Getter
@Setter
public class Grammar {
    @Id
    private Long id;

    @Column(nullable = false)
    private String structure;

    @Column(nullable = false)
    private String explanation;

    @Enumerated(EnumType.STRING)
    private Level level;
}
