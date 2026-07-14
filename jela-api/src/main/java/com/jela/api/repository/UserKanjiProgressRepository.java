package com.jela.api.repository;

import com.jela.api.entity.UserKanjiProgress;
import com.jela.api.enums.KanjiLearningStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserKanjiProgressRepository extends JpaRepository<UserKanjiProgress, Long> {

    Optional<UserKanjiProgress> findByUserIdAndKanjiKanjiId(Long userId, Long kanjiId);

    long countByUserId(Long userId);

    @Query("""
            SELECT MIN(p.nextReviewAt) FROM UserKanjiProgress p
            JOIN UserKanjiListItem i ON i.kanji = p.kanji
            WHERE i.list.listId = :listId AND p.userId = :userId
              AND p.nextReviewAt IS NOT NULL AND p.nextReviewAt <= :now
              AND p.status IN (com.jela.api.enums.KanjiLearningStatus.LEARNING,
                               com.jela.api.enums.KanjiLearningStatus.REVIEWING)
            """)
    Instant findEarliestDueDateByListId(@Param("userId") Long userId, @Param("listId") Long listId, @Param("now") Instant now);

    /**
     * Count kanji already learned (REVIEWING or MASTERED) for a given level
     */
    @Query("""
            SELECT COUNT(p) FROM UserKanjiProgress p
            WHERE p.userId = :userId
              AND p.kanji.jlpt = :jlpt
              AND p.status IN :statuses
            """)
    long countByUserIdAndKanjiJlptAndStatusIn(@Param("userId") Long userId,
                                               @Param("jlpt") String jlpt,
                                               @Param("statuses") List<KanjiLearningStatus> statuses);

    @Query("""
            SELECT p FROM UserKanjiProgress p
            JOIN UserKanjiListItem i ON i.kanji = p.kanji
            WHERE i.list.listId = :listId
              AND i.list.user.userId = :userId
              AND p.userId = :userId
              AND p.nextReviewAt IS NOT NULL
              AND p.nextReviewAt <= :now
              AND p.status IN (com.jela.api.enums.KanjiLearningStatus.LEARNING,
                               com.jela.api.enums.KanjiLearningStatus.REVIEWING)
            ORDER BY p.nextReviewAt ASC
            """)
    List<UserKanjiProgress> findDueReviewsByList(@Param("userId") Long userId,
                                                  @Param("listId") Long listId,
                                                  @Param("now") Instant now,
                                                  Pageable pageable);

    @Query("""
            SELECT p FROM UserKanjiProgress p
            JOIN UserKanjiListItem i ON i.kanji = p.kanji
            WHERE i.list.listId = :listId
              AND i.list.user.userId = :userId
              AND p.userId = :userId
            ORDER BY p.nextReviewAt ASC NULLS LAST, p.id ASC
            """)
    List<UserKanjiProgress> findActiveReviewsByList(@Param("userId") Long userId,
                                                     @Param("listId") Long listId,
                                                     Pageable pageable);

    @Query("""
            SELECT p FROM UserKanjiProgress p
            JOIN UserKanjiListItem i ON i.kanji = p.kanji
            WHERE i.list.listId = :listId
              AND i.list.user.userId = :userId
              AND p.userId = :userId
            ORDER BY p.lastReviewedAt ASC NULLS FIRST, p.id ASC
            """)
    List<UserKanjiProgress> findFallbackReviewsByList(@Param("userId") Long userId,
                                                      @Param("listId") Long listId,
                                                      Pageable pageable);

    @Query("""
            SELECT p FROM UserKanjiProgress p
            JOIN UserKanjiListItem i ON i.kanji = p.kanji
            WHERE i.list.listId = :listId
              AND i.list.user.userId = :userId
              AND p.userId = :userId
              AND p.kanji.kanjiId NOT IN :excludedIds
            ORDER BY p.lastReviewedAt ASC NULLS FIRST, p.id ASC
            """)
    List<UserKanjiProgress> findFallbackReviewsByListExcluding(@Param("userId") Long userId,
                                                               @Param("listId") Long listId,
                                                               @Param("excludedIds") List<Long> excludedIds,
                                                               Pageable pageable);
}
