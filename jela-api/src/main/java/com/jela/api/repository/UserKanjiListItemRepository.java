package com.jela.api.repository;

import com.jela.api.entity.UserKanjiListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserKanjiListItemRepository extends JpaRepository<UserKanjiListItem, Long> {

    long countByListListId(Long listId);

    boolean existsByListListIdAndKanjiKanjiId(Long listId, Long kanjiId);

    @Query(value = """
            SELECT i.kanji_id
            FROM user_kanji_list_item i
            JOIN user_kanji_list l ON l.list_id = i.list_id
            LEFT JOIN user_kanji_progress p
                ON p.user_id = :userId
               AND p.kanji_id = i.kanji_id
            WHERE i.list_id = :listId
              AND l.user_id = :userId
              AND p.progress_id IS NULL
            ORDER BY i.item_id ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<Long> findUnprogressedKanjiIds(
            @Param("userId") Long userId,
            @Param("listId") Long listId,
            @Param("limit") int limit);

    @Query(value = """
            SELECT
                k.kanji_id AS "id",
                k.character AS "character"
            FROM user_kanji_list_item i
            JOIN kanji k ON k.kanji_id = i.kanji_id
            WHERE i.list_id = :listId
            ORDER BY i.item_id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<KanjiListItemRow> findKanjisByListIdPaginated(
            @Param("listId") Long listId,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query(value = """
            SELECT COUNT(*)
            FROM user_kanji_list_item
            WHERE list_id = :listId
            """, nativeQuery = true)
    long countKanjisByListId(@Param("listId") Long listId);

    interface KanjiListItemRow {
        Long getId();
        String getCharacter();
    }
}
