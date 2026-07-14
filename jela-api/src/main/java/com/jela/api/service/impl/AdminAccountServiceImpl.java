package com.jela.api.service.impl;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.*;
import com.jela.api.entity.AdminLog;
import com.jela.api.entity.Role;
import com.jela.api.entity.User;
import com.jela.api.enums.AuthType;
import com.jela.api.enums.Level;
import com.jela.api.enums.UserStatus;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.*;
import com.jela.api.service.AdminAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAccountServiceImpl implements AdminAccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserKanjiProgressRepository progressRepository;
    private final AdminLogRepository adminLogRepository;
    private final KanjiHistoryRepository kanjiHistoryRepository;
    private final DictionaryHistoryRepository dictionaryHistoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public AdminAccountListResponse getAccounts(
            String keyword,
            String role,
            String status,
            String level,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    ) {
        // Map status
        UserStatus dbStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            dbStatus = status.equalsIgnoreCase("LOCKED") ? UserStatus.DISABLED : UserStatus.ACTIVE;
        }

        // Map role
        String dbRoleName = null;
        if (role != null && !role.equalsIgnoreCase("ALL")) {
            if (role.equalsIgnoreCase("USER")) {
                dbRoleName = "LEARNER";
            } else if (role.equalsIgnoreCase("ADMIN")) {
                dbRoleName = "ADMIN";
            } else {
                dbRoleName = role.toUpperCase();
            }
        }

        // Map level
        Level dbLevel = null;
        if (level != null && !level.equalsIgnoreCase("ALL")) {
            try {
                dbLevel = Level.valueOf(level.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        // Map sorting field
        String sortField = "createdAt";
        if (sortBy != null && (sortBy.equals("fullName") || sortBy.equals("email") || sortBy.equals("createdAt"))) {
            sortField = sortBy;
        }

        Sort.Direction direction = Sort.Direction.DESC;
        if (sortOrder != null && sortOrder.equalsIgnoreCase("asc")) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(direction, sortField));
        Page<User> userPage = userRepository.findAllForAdmin(keyword, dbRoleName, dbStatus, dbLevel, pageable);

        List<AdminAccountResponse> items = userPage.getContent().stream()
                .map(user -> {
                    String userRole = mapDbRoleToFrontend(user.getRoles());
                    AdminLearningProgressResponse progress = getLearningProgress(user);
                    return AdminAccountResponse.builder()
                            .id(user.getUserId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .role(userRole)
                            .currentLevel(user.getLevel() != null ? user.getLevel().name() : null)
                            .createdAt(user.getCreatedAt())
                            .status(user.getStatus() == UserStatus.DISABLED ? "LOCKED" : "ACTIVE")
                            .learningProgress(progress)
                            .build();
                })
                .toList();

        AdminAccountListResponse.PaginationResponse pagination = AdminAccountListResponse.PaginationResponse.builder()
                .page(page)
                .limit(limit)
                .totalItems(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();

        return AdminAccountListResponse.builder()
                .items(items)
                .pagination(pagination)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAccountDetailResponse getAccountById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));

        String userRole = mapDbRoleToFrontend(user.getRoles());
        AdminLearningProgressResponse progress = getLearningProgress(user);
        List<AdminRecentActivityResponse> recentActivities = getRecentActivities(id);
        List<AdminLogResponse> logs = getAccountAdminLogs(id);

        // Find latest locking log if user is disabled
        String lockReason = null;
        Instant lockedAt = null;
        if (user.getStatus() == UserStatus.DISABLED) {
            Optional<AdminLog> latestLockLog = adminLogRepository.findByTargetUserUserIdOrderByCreatedAtDesc(id).stream()
                    .filter(log -> log.getActionType().equals("LOCK_ACCOUNT"))
                    .findFirst();
            if (latestLockLog.isPresent()) {
                lockReason = latestLockLog.get().getReason();
                lockedAt = latestLockLog.get().getCreatedAt();
            }
        }

        // Get internal note from latest log or empty
        String note = "";
        Optional<AdminLog> createOrUpdateLog = adminLogRepository.findByTargetUserUserIdOrderByCreatedAtDesc(id).stream()
                .filter(log -> log.getActionType().equals("CREATE_ACCOUNT") || log.getActionType().equals("UPDATE_ACCOUNT"))
                .findFirst();
        if (createOrUpdateLog.isPresent() && createOrUpdateLog.get().getReason() != null) {
            note = createOrUpdateLog.get().getReason();
        }

        return AdminAccountDetailResponse.builder()
                .id(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(userRole)
                .status(user.getStatus() == UserStatus.DISABLED ? "LOCKED" : "ACTIVE")
                .currentLevel(user.getLevel() != null ? user.getLevel().name() : null)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getUpdatedAt()) // Fallback to updatedAt
                .lockReason(lockReason)
                .lockedAt(lockedAt)
                .note(note)
                .learningProgress(progress)
                .recentActivities(recentActivities)
                .adminLogs(logs)
                .build();
    }

    @Override
    public AdminAccountDetailResponse createAccount(AdminCreateAccountRequest request, Long adminId) {
        if (userRepository.existsByEmailIgnoreCaseAndAuthType(request.getEmail(), AuthType.LOCAL)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email này đã tồn tại trên hệ thống");
        }

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy admin"));

        String dbRoleName = request.getRole().equalsIgnoreCase("USER") ? "LEARNER" : request.getRole().toUpperCase();
        Role role = roleRepository.findByRoleName(dbRoleName)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Không tìm thấy vai trò: " + request.getRole()));

        UserStatus userStatus = UserStatus.ACTIVE;
        if (request.getStatus() != null && request.getStatus().equalsIgnoreCase("LOCKED")) {
            userStatus = UserStatus.DISABLED;
        }

        Level level = Level.BEGINNER;
        if (request.getCurrentLevel() != null && !request.getCurrentLevel().isBlank()) {
            try {
                level = Level.valueOf(request.getCurrentLevel().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        User newUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getTemporaryPassword()))
                .status(userStatus)
                .level(level)
                .authType(AuthType.LOCAL)
                .emailVerified(true)
                .roles(new HashSet<>(Collections.singletonList(role)))
                .build();

        newUser = userRepository.save(newUser);

        // Save admin log
        AdminLog log = AdminLog.builder()
                .admin(adminUser)
                .targetUser(newUser)
                .actionType("CREATE_ACCOUNT")
                .oldValue(null)
                .newValue(request.getRole())
                .reason(request.getNote() != null ? request.getNote().trim() : "Tạo tài khoản mới")
                .build();
        adminLogRepository.save(log);

        return getAccountById(newUser.getUserId());
    }

    @Override
    public AdminAccountDetailResponse updateAccount(Long id, AdminUpdateAccountRequest request, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy admin"));

        StringBuilder changes = new StringBuilder();
        if (request.getFullName() != null && !request.getFullName().isBlank() && !request.getFullName().equals(user.getFullName())) {
            changes.append("Đổi tên: ").append(user.getFullName()).append(" -> ").append(request.getFullName()).append(". ");
            user.setFullName(request.getFullName().trim());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().equals(user.getAvatarUrl())) {
            changes.append("Đổi avatar. ");
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getCurrentLevel() != null && !request.getCurrentLevel().isBlank()) {
            try {
                Level newLevel = Level.valueOf(request.getCurrentLevel().toUpperCase());
                if (newLevel != user.getLevel()) {
                    changes.append("Đổi cấp độ: ").append(user.getLevel() != null ? user.getLevel().name() : "BEGINNER")
                            .append(" -> ").append(newLevel.name()).append(". ");
                    user.setLevel(newLevel);
                }
            } catch (IllegalArgumentException ignored) {}
        }

        user = userRepository.save(user);

        if (!changes.isEmpty()) {
            AdminLog log = AdminLog.builder()
                    .admin(adminUser)
                    .targetUser(user)
                    .actionType("UPDATE_ACCOUNT")
                    .oldValue(null)
                    .newValue(null)
                    .reason(request.getNote() != null && !request.getNote().isBlank() ? request.getNote() : changes.toString())
                    .build();
            adminLogRepository.save(log);
        }

        return getAccountById(id);
    }

    @Override
    public AdminAccountDetailResponse changeAccountRole(Long id, AdminChangeRoleRequest request, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy admin"));

        String oldRoleName = mapDbRoleToFrontend(user.getRoles());
        if (oldRoleName.equalsIgnoreCase(request.getRole())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vai trò mới phải khác vai trò hiện tại");
        }

        String dbRoleName = request.getRole().equalsIgnoreCase("USER") ? "LEARNER" : request.getRole().toUpperCase();
        Role role = roleRepository.findByRoleName(dbRoleName)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Không tìm thấy vai trò: " + request.getRole()));

        user.getRoles().clear();
        user.getRoles().add(role);

        // If changed to USER/LEARNER, set default level to N5 if current is BEGINNER/null
        if (dbRoleName.equals("LEARNER")) {
            if (user.getLevel() == null || user.getLevel() == Level.BEGINNER) {
                user.setLevel(Level.N5);
            }
        } else {
            user.setLevel(Level.BEGINNER); // non-learners don't have N-levels
        }

        user = userRepository.save(user);

        AdminLog log = AdminLog.builder()
                .admin(adminUser)
                .targetUser(user)
                .actionType("CHANGE_ROLE")
                .oldValue(oldRoleName)
                .newValue(request.getRole())
                .reason(request.getReason() != null ? request.getReason().trim() : "Thay đổi phân quyền")
                .build();
        adminLogRepository.save(log);

        return getAccountById(id);
    }

    @Override
    public AdminAccountDetailResponse lockAccount(Long id, AdminLockRequest request, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));

        if (user.getStatus() == UserStatus.DISABLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tài khoản đã bị khóa từ trước");
        }

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy admin"));

        user.setStatus(UserStatus.DISABLED);
        user = userRepository.save(user);

        AdminLog log = AdminLog.builder()
                .admin(adminUser)
                .targetUser(user)
                .actionType("LOCK_ACCOUNT")
                .oldValue("ACTIVE")
                .newValue("LOCKED")
                .reason(request.getReason().trim())
                .build();
        adminLogRepository.save(log);

        return getAccountById(id);
    }

    @Override
    public AdminAccountDetailResponse unlockAccount(Long id, AdminUnlockRequest request, Long adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với ID: " + id));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tài khoản đang hoạt động bình thường");
        }

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy admin"));

        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        AdminLog log = AdminLog.builder()
                .admin(adminUser)
                .targetUser(user)
                .actionType("UNLOCK_ACCOUNT")
                .oldValue("LOCKED")
                .newValue("ACTIVE")
                .reason(request.getReason() != null && !request.getReason().isBlank() ? request.getReason().trim() : "Mở khóa tài khoản")
                .build();
        adminLogRepository.save(log);

        return getAccountById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminLogResponse> getAccountAdminLogs(Long id) {
        return adminLogRepository.findByTargetUserUserIdOrderByCreatedAtDesc(id).stream()
                .map(log -> AdminLogResponse.builder()
                        .id(log.getLogId())
                        .createdAt(log.getCreatedAt())
                        .adminName(log.getAdmin().getFullName())
                        .actionType(log.getActionType())
                        .oldValue(log.getOldValue())
                        .newValue(log.getNewValue())
                        .reason(log.getReason())
                        .build())
                .toList();
    }

    // Helper: Map database roles to frontend role string
    private String mapDbRoleToFrontend(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) return "USER";
        List<String> roleNames = roles.stream().map(Role::getRoleName).toList();
        if (roleNames.contains("ADMIN")) return "ADMIN";
        if (roleNames.contains("TUTOR")) return "TUTOR";
        return "USER";
    }

    // Helper: Retrieve progress stat counts
    private AdminLearningProgressResponse getLearningProgress(User user) {
        String roleName = mapDbRoleToFrontend(user.getRoles());
        if (!roleName.equals("USER")) {
            return null; // Not applicable for Admin or Tutor
        }

        int kanjiStudied = (int) progressRepository.countByUserId(user.getUserId());
        // Since vocabulary and quiz details aren't tracked via DB entities yet, return default/calculated progress values
        return AdminLearningProgressResponse.builder()
                .kanji(kanjiStudied)
                .vocabulary(0)
                .quizzes(0)
                .averageScore(0.0)
                .completionRate(kanjiStudied > 0 ? Math.min(100, (kanjiStudied * 100) / 100) : 0) // placeholder rate
                .build();
    }

    // Helper: Combine recent kanji history and vocabulary lookup history
    private List<AdminRecentActivityResponse> getRecentActivities(Long userId) {
        List<AdminRecentActivityResponse> activities = new ArrayList<>();

        // Fetch dictionary lookup history
        try {
            List<DictionaryHistoryRepository.DictionaryHistoryRow> dictHistory =
                    dictionaryHistoryRepository.findHistoryByUserId(userId, 5, 0);
            for (var row : dictHistory) {
                Instant time = row.getSearchedAt().atZone(ZoneId.systemDefault()).toInstant();
                activities.add(AdminRecentActivityResponse.builder()
                        .date(time)
                        .activity("Tra cứu từ vựng: " + (row.getKanji() != null ? row.getKanji() : "ID " + row.getId()))
                        .score(null)
                        .build());
            }
        } catch (Exception ignored) {}

        // Fetch kanji lookup history
        try {
            List<KanjiHistoryRepository.KanjiHistoryRow> kanjiHistory =
                    kanjiHistoryRepository.findHistoryByUserId(userId, 5, 0);
            for (var row : kanjiHistory) {
                Instant time = row.getSearchedAt().atZone(ZoneId.systemDefault()).toInstant();
                activities.add(AdminRecentActivityResponse.builder()
                        .date(time)
                        .activity("Tra cứu Kanji: " + row.getCharacter())
                        .score(null)
                        .build());
            }
        } catch (Exception ignored) {}

        // Sort descending by date and limit to top 5
        return activities.stream()
                .sorted(Comparator.comparing(AdminRecentActivityResponse::date).reversed())
                .limit(5)
                .toList();
    }
}
