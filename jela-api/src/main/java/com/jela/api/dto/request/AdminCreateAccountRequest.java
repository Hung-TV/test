package com.jela.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminCreateAccountRequest {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String role; // USER, TUTOR, ADMIN

    private String status; // ACTIVE, LOCKED

    @NotBlank
    private String temporaryPassword;

    private boolean mustChangePassword;

    private String currentLevel; // N5, N4, N3, N2, N1

    private String note;
}
