package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminAccountResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String currentLevel,
        Instant createdAt,
        String status,
        AdminLearningProgressResponse learningProgress
) {}
