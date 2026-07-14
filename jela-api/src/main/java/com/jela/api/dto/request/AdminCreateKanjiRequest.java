package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminCreateKanjiRequest {
    @NotBlank
    private String character;

    @NotBlank
    private String meaning; // Maps to reading (Sino-Vietnamese) in DB

    private String onyomi; // Comma separated

    private String kunyomi; // Comma separated

    @NotBlank
    private String jlptLevel; // e.g. N5

    @NotNull
    private Integer strokeCount;

    private String radical;

    private String exampleJapanese;

    private String exampleVietnamese;

    private String mnemonic;

    private String status; // ACTIVE, HIDDEN
}
