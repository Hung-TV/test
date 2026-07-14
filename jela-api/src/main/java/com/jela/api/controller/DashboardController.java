package com.jela.api.controller;

import com.jela.api.dto.response.DashboardResponse;
import com.jela.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboard(Authentication authentication) {
        Long userId = authentication == null ? null : (Long) authentication.getPrincipal();
        return dashboardService.getDashboardStats(userId);
    }
}
