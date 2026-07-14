package com.jela.api.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record UserMeResponse(
        Long userId,
        String email,
        String fullName,
        String avatarUrl,
        String phone,
        String level,
        boolean emailVerified,
        String status,
        String authType,
        List<String> roles,
        Integer streakCount,
        java.time.Instant lastStudiedAt
) {}
