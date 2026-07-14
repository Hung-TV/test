package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminLogResponse(
        Long id,
        Instant createdAt,
        String adminName,
        String actionType,
        String oldValue,
        String newValue,
        String reason
) {}
