package com.jela.api.service;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AdminAccountDetailResponse;
import com.jela.api.dto.response.AdminAccountListResponse;
import com.jela.api.dto.response.AdminLogResponse;

import java.util.List;

public interface AdminAccountService {
    AdminAccountListResponse getAccounts(
            String keyword,
            String role,
            String status,
            String level,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    );

    AdminAccountDetailResponse getAccountById(Long id);

    AdminAccountDetailResponse createAccount(AdminCreateAccountRequest request, Long adminId);

    AdminAccountDetailResponse updateAccount(Long id, AdminUpdateAccountRequest request, Long adminId);

    AdminAccountDetailResponse changeAccountRole(Long id, AdminChangeRoleRequest request, Long adminId);

    AdminAccountDetailResponse lockAccount(Long id, AdminLockRequest request, Long adminId);

    AdminAccountDetailResponse unlockAccount(Long id, AdminUnlockRequest request, Long adminId);

    List<AdminLogResponse> getAccountAdminLogs(Long id);
}
