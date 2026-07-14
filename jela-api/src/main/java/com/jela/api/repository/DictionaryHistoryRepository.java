package com.jela.api.repository;

import com.jela.api.entity.DictionaryHistory;
import com.jela.api.entity.DictionaryHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DictionaryHistoryRepository extends JpaRepository<DictionaryHistory, DictionaryHistoryId> {

    @Modifying
    @Query(value = """
            INSERT INTO dictionary_history (user_id, dictionary_id, searched_at)
            VALUES (:userId, :dictionaryId, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, dictionary_id)
            DO UPDATE SET searched_at = EXCLUDED.searched_at
            """, nativeQuery = true)
    void upsertHistory(@Param("userId") Long userId, @Param("dictionaryId") Long dictionaryId);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                h.searched_at AS "searchedAt"
            FROM dictionary_history h
            JOIN dictionary d ON d.dictionary_id = h.dictionary_id
            WHERE h.user_id = :userId
            ORDER BY h.searched_at DESC, h.dictionary_id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<DictionaryHistoryRow> findHistoryByUserId(@Param("userId") Long userId,
                                                   @Param("limit") int limit,
                                                   @Param("offset") long offset);

    interface DictionaryHistoryRow {
        Long getId();

        String getKanji();

        LocalDateTime getSearchedAt();
    }

    @Query(value = """
            SELECT COUNT(*) FROM dictionary_history WHERE user_id = :userId
            """, nativeQuery = true)
    long countHistoryByUserId(@Param("userId") Long userId);
}
