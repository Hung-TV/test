package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminChangeRoleRequest {
    @NotBlank
    private String role; // USER, TUTOR, ADMIN

    private String reason;
}
