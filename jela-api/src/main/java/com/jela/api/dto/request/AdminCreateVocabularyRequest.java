package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminCreateVocabularyRequest {
    @NotBlank
    private String word; // kanji

    @NotBlank
    private String kana; // hiragana

    @NotBlank
    private String meaning; // gloss

    @NotBlank
    private String jlptLevel; // e.g. N5

    private String partOfSpeech; // pos

    private String exampleJapanese; // sentence_jp / ex_text

    private String exampleVietnamese; // sentence_vi

    private String status; // ACTIVE, HIDDEN
}
