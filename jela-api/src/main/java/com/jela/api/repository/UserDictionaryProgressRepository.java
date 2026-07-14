package com.jela.api.repository;

import com.jela.api.entity.UserDictionaryProgress;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserDictionaryProgressRepository extends JpaRepository<UserDictionaryProgress, Long> {

    Optional<UserDictionaryProgress> findByUserIdAndDictionaryDictionaryId(Long userId, Long dictionaryId);

    long countByUserId(Long userId);

    @Query(value = """
            SELECT MIN(p.next_review_at) FROM user_dictionary_progress p
            JOIN user_dictionary_list_item i ON i.dictionary_id = p.dictionary_id
            WHERE i.list_id = :listId AND p.user_id = :userId
              AND p.next_review_at IS NOT NULL AND p.next_review_at <= :now
              AND p.status IN ('LEARNING', 'REVIEWING')
            """, nativeQuery = true)
    Instant findEarliestDueDateByListId(@Param("userId") Long userId, @Param("listId") Long listId, @Param("now") Instant now);

    @Query(value = """
            SELECT i.dictionary_id
            FROM user_dictionary_list_item i
            LEFT JOIN user_dictionary_progress p
              ON p.dictionary_id = i.dictionary_id AND p.user_id = :userId
            WHERE i.list_id = :listId AND p.progress_id IS NULL
            ORDER BY i.item_id ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<Long> findUnprogressedWordIds(@Param("userId") Long userId,
                                       @Param("listId") Long listId,
                                       @Param("limit") int limit);

    @Query(value = """
            SELECT COUNT(p.progress_id)
            FROM user_dictionary_progress p
            JOIN dictionary d ON d.dictionary_id = p.dictionary_id
            WHERE p.user_id = :userId
              AND p.status IN :statuses
            """, nativeQuery = true)
    long countByUserIdAndStatusIn(@Param("userId") Long userId,
                                  @Param("statuses") List<String> statuses);

    @Query(value = """
            SELECT p.*
            FROM user_dictionary_progress p
            JOIN user_dictionary_list_item i ON i.dictionary_id = p.dictionary_id
            WHERE i.list_id = :listId
              AND p.user_id = :userId
              AND p.next_review_at IS NOT NULL
              AND p.next_review_at <= :now
              AND p.status IN ('LEARNING', 'REVIEWING')
            ORDER BY p.next_review_at ASC
            """, nativeQuery = true)
    List<UserDictionaryProgress> findDueReviewsByList(@Param("userId") Long userId,
                                                      @Param("listId") Long listId,
                                                      @Param("now") Instant now,
                                                      Pageable pageable);

    @Query(value = """
            SELECT p.*
            FROM user_dictionary_progress p
            JOIN user_dictionary_list_item i ON i.dictionary_id = p.dictionary_id
            WHERE i.list_id = :listId
              AND p.user_id = :userId
            ORDER BY p.next_review_at ASC NULLS LAST, p.progress_id ASC
            """, nativeQuery = true)
    List<UserDictionaryProgress> findActiveReviewsByList(@Param("userId") Long userId,
                                                         @Param("listId") Long listId,
                                                         Pageable pageable);

    @Query(value = """
            SELECT p.*
            FROM user_dictionary_progress p
            JOIN user_dictionary_list_item i ON i.dictionary_id = p.dictionary_id
            WHERE i.list_id = :listId
              AND p.user_id = :userId
            ORDER BY p.last_reviewed_at ASC NULLS FIRST, p.progress_id ASC
            """, nativeQuery = true)
    List<UserDictionaryProgress> findFallbackReviewsByList(@Param("userId") Long userId,
                                                           @Param("listId") Long listId,
                                                           Pageable pageable);

    @Query(value = """
            SELECT p.*
            FROM user_dictionary_progress p
            JOIN user_dictionary_list_item i ON i.dictionary_id = p.dictionary_id
            WHERE i.list_id = :listId
              AND p.user_id = :userId
              AND p.dictionary_id NOT IN :excludedIds
            ORDER BY p.last_reviewed_at ASC NULLS FIRST, p.progress_id ASC
            """, nativeQuery = true)
    List<UserDictionaryProgress> findFallbackReviewsByListExcluding(@Param("userId") Long userId,
                                                                    @Param("listId") Long listId,
                                                                    @Param("excludedIds") List<Long> excludedIds,
                                                                    Pageable pageable);
}
