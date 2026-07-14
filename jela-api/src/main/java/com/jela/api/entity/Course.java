package com.jela.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Getter
@Setter
public class Course {
    @Id
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
}
