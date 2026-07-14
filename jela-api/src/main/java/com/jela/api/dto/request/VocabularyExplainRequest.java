package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VocabularyExplainRequest {
    @NotBlank
    private String correctWord;

    @NotBlank
    private String selectedWord;

    private String questionType;

    private String questionText;
    private String correctMeaning;
    private String selectedMeaning;
    private String correctHiragana;
}
