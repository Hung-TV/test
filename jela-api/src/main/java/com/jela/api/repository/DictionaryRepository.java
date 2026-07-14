package com.jela.api.repository;

import com.jela.api.entity.Dictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DictionaryRepository extends JpaRepository<Dictionary, Long> {

    @Query(value = """
            SELECT d.dictionary_id
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            WHERE d.kanji ILIKE CONCAT('%', :searchKey, '%')
               OR d.hiragana ILIKE CONCAT('%', :searchKey, '%')
               OR m.gloss ILIKE CONCAT('%', :searchKey, '%')
            GROUP BY d.dictionary_id, d.kanji, d.hiragana
            ORDER BY
                CASE
                    WHEN d.kanji = :searchKey THEN 1
                    WHEN d.hiragana = :searchKey THEN 2
                    WHEN d.kanji ILIKE CONCAT(:searchKey, '%') THEN 3
                    WHEN d.hiragana ILIKE CONCAT(:searchKey, '%') THEN 4
                    WHEN d.kanji ILIKE CONCAT('%', :searchKey, '%') THEN 5
                    WHEN d.hiragana ILIKE CONCAT('%', :searchKey, '%') THEN 6
                    WHEN BOOL_OR(m.gloss ILIKE :searchKey) THEN 7
                    WHEN BOOL_OR(m.gloss ILIKE CONCAT(:searchKey, '%')) THEN 8
                    ELSE 9
                END,
                LENGTH(COALESCE(d.hiragana, '')),
                LENGTH(COALESCE(d.kanji, '')),
                d.dictionary_id ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Long> findSearchResultIds(@Param("searchKey") String searchKey);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                d.hiragana AS "hiragana",
                m.meaning_id AS "meaningId",
                m.gloss AS "gloss"
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            WHERE d.dictionary_id IN (:ids)
            ORDER BY d.dictionary_id, m.meaning_id
            """, nativeQuery = true)
    List<DictionarySearchRow> findSearchRowsByIds(@Param("ids") List<Long> ids);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                d.hiragana AS "hiragana",
                m.meaning_id AS "meaningId",
                m.pos AS "pos",
                m.gloss AS "gloss",
                m.xref AS "xref",
                e.example_id AS "exId",
                e.ex_text AS "exTest",
                e.sentence_jp AS "sentenceJP",
                e.sentence_vi AS "sentenceVI"
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            LEFT JOIN example e ON e.meaning_id = m.meaning_id
            WHERE d.dictionary_id = :id
            ORDER BY m.meaning_id, e.example_id
            """, nativeQuery = true)
    List<DictionaryDetailRow> findDetailRowsById(@Param("id") Long id);

    @Query(value = """
            SELECT
                d.dictionary_id AS "id",
                d.kanji AS "kanji",
                d.hiragana AS "hiragana",
                m.meaning_id AS "meaningId",
                m.pos AS "pos",
                m.gloss AS "gloss",
                m.xref AS "xref",
                e.example_id AS "exId",
                e.ex_text AS "exTest",
                e.sentence_jp AS "sentenceJP",
                e.sentence_vi AS "sentenceVI"
            FROM dictionary d
            LEFT JOIN meaning m ON m.dictionary_id = d.dictionary_id
            LEFT JOIN example e ON e.meaning_id = m.meaning_id
            WHERE d.dictionary_id IN :ids
            ORDER BY d.dictionary_id, m.meaning_id, e.example_id
            """, nativeQuery = true)
    List<DictionaryDetailRow> findDetailRowsByIds(@Param("ids") List<Long> ids);

    @Query(value = """
            WITH reading_input AS (
                SELECT reading, reading_order
                FROM unnest(string_to_array(:readings, chr(31)))
                    WITH ORDINALITY AS r(reading, reading_order)
                WHERE reading <> ''
            ),
            candidates AS (
                SELECT
                    d.dictionary_id AS "id",
                    d.kanji AS "word",
                    d.hiragana AS "hiragana",
                    m.gloss AS "meaning",
                    r.reading_order AS "readingOrder",
                    CASE
                        WHEN POSITION(r.reading IN COALESCE(d.hiragana, '')) = 1 THEN 1
                        ELSE 2
                    END AS "prefixRank",
                    LENGTH(COALESCE(d.hiragana, '')) AS "hiraganaLength",
                    LENGTH(COALESCE(d.kanji, '')) AS "wordLength"
                FROM reading_input r
                JOIN dictionary d
                    ON COALESCE(d.kanji, '') LIKE CONCAT('%', :character, '%')
                   AND POSITION(r.reading IN COALESCE(d.hiragana, '')) > 0
                LEFT JOIN meaning m ON m.meaning_id = (
                    SELECT m2.meaning_id
                    FROM meaning m2
                    WHERE m2.dictionary_id = d.dictionary_id
                    ORDER BY m2.meaning_id ASC
                    LIMIT 1
                )
            ),
            ranked AS (
                SELECT
                    *,
                    ROW_NUMBER() OVER (
                        PARTITION BY "readingOrder"
                        ORDER BY "prefixRank", "hiraganaLength", "wordLength", "id"
                    ) AS "readingRank",
                    ROW_NUMBER() OVER (
                        PARTITION BY "id"
                        ORDER BY "prefixRank", "readingOrder"
                    ) AS "wordRank"
                FROM candidates
            )
            SELECT
                "id",
                "word",
                "hiragana",
                "meaning"
            FROM ranked
            WHERE "wordRank" = 1
            ORDER BY
                "readingRank",
                "readingOrder",
                "prefixRank",
                "hiraganaLength",
                "wordLength",
                "id"
            LIMIT :limit
            """, nativeQuery = true)
    List<KanjiExampleWordRow> findKanjiExampleWordsByReadings(
            @Param("character") String character,
            @Param("readings") String readings,
            @Param("limit") int limit);

    boolean existsByKanjiAndHiragana(String kanji, String hiragana);

    boolean existsByKanjiAndHiraganaAndDictionaryIdNot(String kanji, String hiragana, Long dictionaryId);

    java.util.Optional<Dictionary> findByKanjiAndHiragana(String kanji, String hiragana);

    @Query(value = """
            SELECT d.dictionary_id
            FROM dictionary d
            WHERE d.kanji = :word OR d.hiragana = :word
            LIMIT 1
            """, nativeQuery = true)
    Long findFirstIdByWord(@Param("word") String word);

    @Query(value = """
            SELECT d.dictionary_id
            FROM dictionary d
            JOIN meaning m ON m.dictionary_id = d.dictionary_id
            WHERE m.gloss = :gloss OR :gloss LIKE CONCAT('%', m.gloss, '%')
            LIMIT 1
            """, nativeQuery = true)
    Long findFirstIdByGloss(@Param("gloss") String gloss);

    interface DictionarySearchRow {
        Long getId();

        String getKanji();

        String getHiragana();

        Long getMeaningId();

        String getGloss();
    }

    interface DictionaryDetailRow {
        Long getId();

        String getKanji();

        String getHiragana();

        Long getMeaningId();

        String getPos();

        String getGloss();

        String getXref();

        Long getExId();

        String getExTest();

        String getSentenceJP();

        String getSentenceVI();
    }

    interface KanjiExampleWordRow {
        Long getId();

        String getWord();

        String getHiragana();

        String getMeaning();
    }
}
