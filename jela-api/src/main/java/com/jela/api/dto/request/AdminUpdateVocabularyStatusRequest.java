package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateVocabularyStatusRequest {
    @NotBlank
    private String status; // ACTIVE, HIDDEN
}
