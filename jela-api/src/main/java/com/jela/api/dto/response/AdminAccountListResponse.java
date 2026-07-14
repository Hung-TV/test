package com.jela.api.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public record AdminAccountListResponse(
        List<AdminAccountResponse> items,
        PaginationResponse pagination
) {
    @Builder
    public record PaginationResponse(
            int page,
            int limit,
            long totalItems,
            int totalPages
    ) {}
}
