package com.jela.api.controller;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AdminAccountDetailResponse;
import com.jela.api.dto.response.AdminAccountListResponse;
import com.jela.api.dto.response.AdminLogResponse;
import com.jela.api.service.AdminAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    @GetMapping
    public AdminAccountListResponse getAccounts(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "role", required = false, defaultValue = "ALL") String role,
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status,
            @RequestParam(value = "level", required = false, defaultValue = "ALL") String level,
            @RequestParam(value = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortOrder", required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        return adminAccountService.getAccounts(keyword, role, status, level, sortBy, sortOrder, page, limit);
    }

    @GetMapping("/{id}")
    public AdminAccountDetailResponse getAccountById(@PathVariable("id") Long id) {
        return adminAccountService.getAccountById(id);
    }

    @PostMapping
    public AdminAccountDetailResponse createAccount(
            Authentication authentication,
            @Valid @RequestBody AdminCreateAccountRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return adminAccountService.createAccount(request, adminId);
    }

    @PutMapping("/{id}")
    public AdminAccountDetailResponse updateAccount(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUpdateAccountRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return adminAccountService.updateAccount(id, request, adminId);
    }

    @PatchMapping("/{id}/role")
    public AdminAccountDetailResponse changeAccountRole(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminChangeRoleRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return adminAccountService.changeAccountRole(id, request, adminId);
    }

    @PatchMapping("/{id}/lock")
    public AdminAccountDetailResponse lockAccount(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminLockRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return adminAccountService.lockAccount(id, request, adminId);
    }

    @PatchMapping("/{id}/unlock")
    public AdminAccountDetailResponse unlockAccount(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUnlockRequest request
    ) {
        Long adminId = (Long) authentication.getPrincipal();
        return adminAccountService.unlockAccount(id, request, adminId);
    }

    @GetMapping("/{id}/admin-logs")
    public List<AdminLogResponse> getAccountAdminLogs(@PathVariable("id") Long id) {
        return adminAccountService.getAccountAdminLogs(id);
    }
}
