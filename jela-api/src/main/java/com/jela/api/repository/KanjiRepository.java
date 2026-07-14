package com.jela.api.repository;

import com.jela.api.entity.Kanji;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KanjiRepository extends JpaRepository<Kanji, Long> {

    Page<Kanji> findByJlpt(String jlpt, Pageable pageable);

    long countByJlpt(String jlpt);

    /**
     * Search across character, Han-Viet reading, onyomi, kunyomi, and meanings.
     * Meaning matches are intentionally ranked after written-form and reading matches.
     */
    @Query(value = """
            SELECT k.kanji_id
            FROM kanji k
            WHERE k.character ILIKE CONCAT('%', :searchKey, '%')
               OR k.reading ILIKE CONCAT('%', :searchKey, '%')
               OR COALESCE(array_to_string(k.readings_on, ' '), '') ILIKE CONCAT('%', :searchKey, '%')
               OR COALESCE(array_to_string(k.readings_kun, ' '), '') ILIKE CONCAT('%', :searchKey, '%')
               OR COALESCE(array_to_string(k.meanings, ' '), '') ILIKE CONCAT('%', :searchKey, '%')
            ORDER BY
                CASE
                    WHEN k.character = :searchKey THEN 1
                    WHEN k.character ILIKE CONCAT(:searchKey, '%') THEN 2
                    WHEN k.reading = :searchKey THEN 3
                    WHEN k.reading ILIKE CONCAT(:searchKey, '%') THEN 4
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(k.readings_on) AS ron
                        WHERE ron = :searchKey
                    ) THEN 5
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(k.readings_kun) AS rkun
                        WHERE rkun = :searchKey
                    ) THEN 6
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(k.readings_on) AS ron
                        WHERE ron ILIKE CONCAT(:searchKey, '%')
                    ) THEN 7
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(k.readings_kun) AS rkun
                        WHERE rkun ILIKE CONCAT(:searchKey, '%')
                    ) THEN 8
                    WHEN k.character ILIKE CONCAT('%', :searchKey, '%') THEN 9
                    WHEN k.reading ILIKE CONCAT('%', :searchKey, '%') THEN 10
                    WHEN COALESCE(array_to_string(k.readings_on, ' '), '') ILIKE CONCAT('%', :searchKey, '%') THEN 11
                    WHEN COALESCE(array_to_string(k.readings_kun, ' '), '') ILIKE CONCAT('%', :searchKey, '%') THEN 12
                    ELSE 13
                END,
                k.kanji_id ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Long> findSearchResultIds(@Param("searchKey") String searchKey);

    @Query("SELECT k FROM Kanji k WHERE k.kanjiId IN :ids")
    List<Kanji> findAllByIdIn(@Param("ids") List<Long> ids);

    boolean existsByCharacter(String character);

    java.util.Optional<Kanji> findByCharacter(String character);

    boolean existsByCharacterAndKanjiIdNot(String character, Long kanjiId);

    @Query(value = """
        SELECT * FROM kanji k
        WHERE (:keyword IS NULL OR :keyword = ''
               OR k.character ILIKE CONCAT('%', :keyword, '%')
               OR k.reading ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.readings_on, ' '), '') ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.readings_kun, ' '), '') ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.meanings, ' '), '') ILIKE CONCAT('%', :keyword, '%'))
          AND (:jlpt IS NULL OR :jlpt = '' OR k.jlpt = :jlpt)
          AND (:status IS NULL OR :status = '' OR k.status = :status)
        """,
        countQuery = """
        SELECT COUNT(*) FROM kanji k
        WHERE (:keyword IS NULL OR :keyword = ''
               OR k.character ILIKE CONCAT('%', :keyword, '%')
               OR k.reading ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.readings_on, ' '), '') ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.readings_kun, ' '), '') ILIKE CONCAT('%', :keyword, '%')
               OR COALESCE(array_to_string(k.meanings, ' '), '') ILIKE CONCAT('%', :keyword, '%'))
          AND (:jlpt IS NULL OR :jlpt = '' OR k.jlpt = :jlpt)
          AND (:status IS NULL OR :status = '' OR k.status = :status)
        """,
        nativeQuery = true)
    Page<Kanji> findAllForAdmin(
        @Param("keyword") String keyword,
        @Param("jlpt") String jlpt,
        @Param("status") String status,
        Pageable pageable
    );
}
