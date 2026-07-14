package com.jela.api.repository;

import com.jela.api.entity.UserDictionaryList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserDictionaryListRepository extends JpaRepository<UserDictionaryList, Long> {

    @Query(value = """
            SELECT
                l.list_id AS "id",
                l.list_name AS "name",
                l.updated_at AS "updatedAt",
                COUNT(i.item_id) AS "wordCount",
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
            FROM user_dictionary_list l
            LEFT JOIN user_dictionary_list_item i ON i.list_id = l.list_id
            LEFT JOIN user_dictionary_progress p
                ON p.user_id = :userId
               AND p.dictionary_id = i.dictionary_id
            WHERE l.user_id = :userId
            GROUP BY l.list_id, l.list_name, l.updated_at
            ORDER BY l.updated_at DESC, l.list_id DESC
            """, nativeQuery = true)
    List<DictionaryListSummaryRow> findAllSummariesByUserId(
            @Param("userId") Long userId,
            @Param("now") java.time.Instant now);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM user_dictionary_list l
                WHERE l.list_id = :listId
                  AND l.user_id = :userId
            )
            """, nativeQuery = true)
    boolean existsByListIdAndUserId(@Param("listId") Long listId, @Param("userId") Long userId);

    boolean existsByUserUserIdAndListName(Long userId, String listName);

    @Modifying
    @Query(value = """
            INSERT INTO user_dictionary_list_item (list_id, dictionary_id)
            VALUES (:listId, :wordId)
            ON CONFLICT (list_id, dictionary_id) DO NOTHING
            """, nativeQuery = true)
    int addWordToList(@Param("listId") Long listId, @Param("wordId") Long wordId);

    @Modifying
    @Query(value = """
            UPDATE user_dictionary_list
            SET updated_at = CURRENT_TIMESTAMP
            WHERE list_id = :listId
            """, nativeQuery = true)
    void touchList(@Param("listId") Long listId);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                d.hiragana AS "hiragana"
            FROM user_dictionary_list_item i
            JOIN dictionary d ON d.dictionary_id = i.dictionary_id
            WHERE i.list_id = :listId
            ORDER BY i.item_id DESC
            """, nativeQuery = true)
    List<DictionaryListWordRow> findWordsByListId(@Param("listId") Long listId);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                d.hiragana AS "hiragana"
            FROM user_dictionary_list_item i
            JOIN dictionary d ON d.dictionary_id = i.dictionary_id
            WHERE i.list_id = :listId
            ORDER BY i.item_id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<DictionaryListWordRow> findWordsByListIdPaginated(
            @Param("listId") Long listId,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query(value = """
            SELECT COUNT(*)
            FROM user_dictionary_list_item
            WHERE list_id = :listId
            """, nativeQuery = true)
    long countWordsByListId(@Param("listId") Long listId);

    interface DictionaryListSummaryRow {
        Long getId();

        String getName();

        Number getWordCount();

        java.time.Instant getUpdatedAt();

        Number getDueCount();

        Number getMasteredCount();

        Number getNewCount();

        Number getLearningCount();
    }

    interface DictionaryListWordRow {
        Long getId();

        String getKanji();

        String getHiragana();
    }

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM user_dictionary_list_item
                WHERE list_id = :listId AND dictionary_id = :wordId
            )
            """, nativeQuery = true)
    boolean existsWordInList(@Param("listId") Long listId, @Param("wordId") Long wordId);
}
