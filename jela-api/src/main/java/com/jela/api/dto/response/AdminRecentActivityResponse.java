package com.jela.api.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record AdminRecentActivityResponse(
        Instant date,
        String activity,
        String score
) {}
