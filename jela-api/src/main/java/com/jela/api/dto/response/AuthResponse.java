package com.jela.api.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        UserResponse user
) {
    @Builder
    public record UserResponse(Long userId, String email, String fullName, List<String> roles) {}
}

