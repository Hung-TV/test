package com.jela.api.dataimport;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.junit.jupiter.api.Test;

import java.io.StringReader;

import static org.assertj.core.api.Assertions.assertThat;

class DataImportRecordMapperTests {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void mapsDictionaryCsvWithPipeDelimiterAndQuotes() throws Exception {
        CSVParser parser = CSVFormat.DEFAULT.builder()
                .setDelimiter('|')
                .setQuote('"')
                .setHeader()
                .setSkipHeaderRecord(true)
                .get()
                .parse(new StringReader("""
                        "id"|"kanji"|"hiragana"
                        "42"|"安全"|"あんぜん"
                        """));

        DataImportRecordMapper.DictionaryRow row = DataImportRecordMapper.toDictionaryRow(parser.getRecords().get(0));

        assertThat(row.dictionaryId()).isEqualTo(42L);
        assertThat(row.kanji()).isEqualTo("安全");
        assertThat(row.hiragana()).isEqualTo("あんぜん");
    }

    @Test
    void mapsMeaningCsvAndKeepsBlankXref() throws Exception {
        CSVParser parser = CSVFormat.DEFAULT.builder()
                .setDelimiter('|')
                .setQuote('"')
                .setHeader()
                .setSkipHeaderRecord(true)
                .get()
                .parse(new StringReader("""
                        "id"|"word_id"|"pos"|"gloss"|"xref"
                        "7"|"3"|"Danh từ"|"từ; từ đó đến nay"|""
                        """));

        DataImportRecordMapper.MeaningRow row = DataImportRecordMapper.toMeaningRow(parser.getRecords().get(0));

        assertThat(row.meaningId()).isEqualTo(7L);
        assertThat(row.dictionaryId()).isEqualTo(3L);
        assertThat(row.pos()).isEqualTo("Danh từ");
        assertThat(row.gloss()).isEqualTo("từ; từ đó đến nay");
        assertThat(row.xref()).isEmpty();
    }

    @Test
    void mapsExampleCsvColumnsToMigrationColumns() throws Exception {
        CSVParser parser = CSVFormat.DEFAULT.builder()
                .setDelimiter('|')
                .setQuote('"')
                .setHeader()
                .setSkipHeaderRecord(true)
                .get()
                .parse(new StringReader("""
                        "id"|"meaning_id"|"ex_text"|"sentence_jp"|"sentence_vi"
                        "1"|"1"|"安全に"|"君は自分の安全にもっと気を配るべきだ。"|"Bạn nên cẩn thận hơn về sự an toàn của mình."
                        """));

        DataImportRecordMapper.ExampleRow row = DataImportRecordMapper.toExampleRow(parser.getRecords().get(0));

        assertThat(row.exampleId()).isEqualTo(1L);
        assertThat(row.meaningId()).isEqualTo(1L);
        assertThat(row.exText()).isEqualTo("安全に");
        assertThat(row.sentenceJp()).isEqualTo("君は自分の安全にもっと気を配るべきだ。");
        assertThat(row.sentenceVi()).isEqualTo("Bạn nên cẩn thận hơn về sự an toàn của mình.");
    }

    @Test
    void mapsKanjiJsonToMigrationColumns() throws Exception {
        var node = objectMapper.readTree("""
                ["愛","ái","","",["[ái] yêu, thích, quý","[ái] hay, thường xuyên"],{
                  "Strokes":"13",
                  "Radical":"tâm 心 (+9 nét)",
                  "PenStrokes":"ignored",
                  "Shape":"⿳⿱爫冖心夂",
                  "Unicode":"U+611B",
                  "jlpt":"N3",
                  "readings_on":["あい"],
                  "readings_kun":["いと.しい","かな.しい"]
                }]
                """);

        DataImportRecordMapper.KanjiRow row = DataImportRecordMapper.toKanjiRow(node);

        assertThat(row.character()).isEqualTo("愛");
        assertThat(row.reading()).isEqualTo("ÁI");
        assertThat(row.meanings()).containsExactly("[ái] yêu, thích, quý", "[ái] hay, thường xuyên");
        assertThat(row.strokes()).isEqualTo(13);
        assertThat(row.radical()).isEqualTo("tâm 心 (+9 nét)");
        assertThat(row.shape()).isEqualTo("⿳⿱爫冖心夂");
        assertThat(row.readingsOn()).containsExactly("あい");
        assertThat(row.readingsKun()).containsExactly("いと.しい", "かな.しい");
        assertThat(row.jlpt()).isEqualTo("N3");
    }
}
