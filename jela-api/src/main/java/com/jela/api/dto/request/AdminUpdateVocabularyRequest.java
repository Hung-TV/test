package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateVocabularyRequest {
    @NotBlank
    private String word;

    @NotBlank
    private String kana;

    @NotBlank
    private String meaning;

    @NotBlank
    private String jlptLevel;

    private String partOfSpeech;

    private String exampleJapanese;

    private String exampleVietnamese;

    private String status;
}
