package com.jela.api.service;

import com.jela.api.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardStats(Long userId);
}
