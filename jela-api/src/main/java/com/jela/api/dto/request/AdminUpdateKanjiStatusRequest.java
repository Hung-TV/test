package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateKanjiStatusRequest {
    @NotBlank
    private String status; // ACTIVE, HIDDEN
}
