package com.jela.api.repository;

import com.jela.api.entity.UserKanjiList;
import com.jela.api.enums.KanjiListSourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserKanjiListRepository extends JpaRepository<UserKanjiList, Long> {

    Optional<UserKanjiList> findByUserUserIdAndSourceTypeAndListName(
            Long userId,
            KanjiListSourceType sourceType,
            String listName);

    boolean existsByUserUserIdAndListName(Long userId, String listName);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM user_kanji_list l
                WHERE l.list_id = :listId
                  AND l.user_id = :userId
            )
            """, nativeQuery = true)
    boolean existsByListIdAndUserId(@Param("listId") Long listId, @Param("userId") Long userId);

    @Modifying
    @Query(value = """
            INSERT INTO user_kanji_list_item (list_id, kanji_id)
            VALUES (:listId, :kanjiId)
            ON CONFLICT (list_id, kanji_id) DO NOTHING
            """, nativeQuery = true)
    int addKanjiToList(@Param("listId") Long listId, @Param("kanjiId") Long kanjiId);

    @Modifying
    @Query(value = """
            INSERT INTO user_kanji_list_item (list_id, kanji_id)
            SELECT :listId, level_kanji.kanji_id
            FROM (
                SELECT k.kanji_id
                FROM kanji k
                WHERE k.jlpt = :level
                ORDER BY k.kanji_id ASC
            ) level_kanji
            ON CONFLICT (list_id, kanji_id) DO NOTHING
            """, nativeQuery = true)
    int addKanjiByLevelToList(@Param("listId") Long listId, @Param("level") String level);

    @Query(value = """
            SELECT
                l.list_id AS "listId",
                l.list_name AS "listName",
                l.source_type AS "sourceType",
                l.updated_at AS "updatedAt",
                COUNT(i.item_id) AS "totalCount",
                COUNT(CASE
                    WHEN i.item_id IS NOT NULL
                     AND p.next_review_at IS NOT NULL
                     AND p.next_review_at <= :now
                     AND p.status IN ('LEARNING', 'REVIEWING')
                    THEN 1
                END) AS "dueCount",
                COUNT(CASE WHEN i.item_id IS NOT NULL AND p.status = 'MASTERED' THEN 1 END) AS "masteredCount",
                COUNT(CASE WHEN i.item_id IS NOT NULL AND (p.progress_id IS NULL OR p.status = 'NEW') THEN 1 END) AS "newCount",
                COUNT(CASE WHEN i.item_id IS NOT NULL AND p.progress_id IS NOT NULL AND p.status IN ('LEARNING', 'REVIEWING') THEN 1 END) AS "learningCount"
            FROM user_kanji_list l
            LEFT JOIN user_kanji_list_item i ON i.list_id = l.list_id
            LEFT JOIN user_kanji_progress p
                ON p.user_id = :userId
               AND p.kanji_id = i.kanji_id
            WHERE l.user_id = :userId
            GROUP BY l.list_id, l.list_name, l.source_type, l.updated_at
            ORDER BY l.updated_at DESC, l.list_id DESC
            """, nativeQuery = true)
    List<KanjiListLearnSummaryRow> findLearnSummariesByUserId(
            @Param("userId") Long userId,
            @Param("now") Instant now);

    @Modifying
    @Query(value = """
            UPDATE user_kanji_list
            SET updated_at = CURRENT_TIMESTAMP
            WHERE list_id = :listId
            """, nativeQuery = true)
    void touchList(@Param("listId") Long listId);

    interface KanjiListLearnSummaryRow {
        Long getListId();

        String getListName();

        String getSourceType();

        Instant getUpdatedAt();

        Number getTotalCount();

        Number getDueCount();

        Number getMasteredCount();

        Number getNewCount();

        Number getLearningCount();
    }

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM user_kanji_list_item
                WHERE list_id = :listId AND kanji_id = :kanjiId
            )
            """, nativeQuery = true)
    boolean existsKanjiInList(@Param("listId") Long listId, @Param("kanjiId") Long kanjiId);
}
