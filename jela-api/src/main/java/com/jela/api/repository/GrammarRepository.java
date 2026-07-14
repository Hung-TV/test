package com.jela.api.repository;

import com.jela.api.entity.Grammar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrammarRepository extends JpaRepository<Grammar, Long> {
}
