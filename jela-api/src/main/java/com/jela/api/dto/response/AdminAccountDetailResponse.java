package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Builder
public record AdminAccountDetailResponse(
        Long id,
        String fullName,
        String email,
        String avatarUrl,
        String role,
        String status,
        String currentLevel,
        Instant createdAt,
        Instant lastLoginAt,
        String lockReason,
        Instant lockedAt,
        String note,
        AdminLearningProgressResponse learningProgress,
        List<AdminRecentActivityResponse> recentActivities,
        List<AdminLogResponse> adminLogs
) {}
