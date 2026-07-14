package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateKanjiRequest {
    @NotBlank
    private String character;

    @NotBlank
    private String meaning;

    private String onyomi;

    private String kunyomi;

    @NotBlank
    private String jlptLevel;

    @NotNull
    private Integer strokeCount;

    private String radical;

    private String exampleJapanese;

    private String exampleVietnamese;

    private String mnemonic;

    private String status;
}
