package com.jela.api.repository;

import com.jela.api.entity.KanjiHistory;
import com.jela.api.entity.KanjiHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface KanjiHistoryRepository extends JpaRepository<KanjiHistory, KanjiHistoryId> {

    @Modifying
    @Query(value = """
            INSERT INTO kanji_history (user_id, kanji_id, searched_at)
            VALUES (:userId, :kanjiId, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, kanji_id)
            DO UPDATE SET searched_at = EXCLUDED.searched_at
            """, nativeQuery = true)
    void upsertHistory(@Param("userId") Long userId, @Param("kanjiId") Long kanjiId);

    @Query(value = """
            SELECT
                k.kanji_id  AS "id",
                k.character AS "character",
                h.searched_at AS "searchedAt"
            FROM kanji_history h
            JOIN kanji k ON k.kanji_id = h.kanji_id
            WHERE h.user_id = :userId
            ORDER BY h.searched_at DESC, h.kanji_id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<KanjiHistoryRow> findHistoryByUserId(@Param("userId") Long userId,
                                               @Param("limit") int limit,
                                               @Param("offset") long offset);

    @Modifying
    @Query(value = """
            DELETE FROM kanji_history
            WHERE user_id = :userId AND kanji_id = :kanjiId
            """, nativeQuery = true)
    int deleteByUserIdAndKanjiId(@Param("userId") Long userId, @Param("kanjiId") Long kanjiId);

    @Query(value = """
            SELECT COUNT(*) FROM kanji_history WHERE user_id = :userId
            """, nativeQuery = true)
    long countHistoryByUserId(@Param("userId") Long userId);

    interface KanjiHistoryRow {
        Long getId();

        String getCharacter();

        LocalDateTime getSearchedAt();
    }
}
