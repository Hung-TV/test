package com.jela.api.service.impl;

import com.jela.api.dto.request.UpdateProfileRequest;
import com.jela.api.dto.response.UserMeResponse;
import com.jela.api.entity.User;
import com.jela.api.entity.EmailVerificationToken;
import com.jela.api.enums.Level;
import com.jela.api.enums.AuthType;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.UserRepository;
import com.jela.api.repository.EmailVerificationTokenRepository;
import com.jela.api.service.UserService;
import com.jela.api.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public UserMeResponse me(Long userId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy user với ID: " + userId));

        var roles = user.getRoles().stream().map(r -> r.getRoleName()).sorted().toList();

        return UserMeResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .level(user.getLevel() != null ? user.getLevel().name() : null)
                .emailVerified(user.isEmailVerified())
                .status(user.getStatus() == null ? null : user.getStatus().name())
                .authType(user.getAuthType() == null ? null : user.getAuthType().name())
                .roles(roles)
                .streakCount(calculateActiveStreak(user))
                .lastStudiedAt(user.getLastStudiedAt())
                .build();
    }

    @Override
    @Transactional
    public UserMeResponse updateProfile(Long userId, UpdateProfileRequest request) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy user với ID: " + userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getLevel() != null) {
            try {
                user.setLevel(Level.valueOf(request.getLevel().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Level không hợp lệ.");
            }
        }

        userRepository.save(user);

        var roles = user.getRoles().stream().map(r -> r.getRoleName()).sorted().toList();

        return UserMeResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .level(user.getLevel() != null ? user.getLevel().name() : null)
                .emailVerified(user.isEmailVerified())
                .status(user.getStatus() == null ? null : user.getStatus().name())
                .authType(user.getAuthType() == null ? null : user.getAuthType().name())
                .roles(roles)
                .streakCount(calculateActiveStreak(user))
                .lastStudiedAt(user.getLastStudiedAt())
                .build();
    }

    @Override
    @Transactional
    public void updateStreak(Long userId) {
        if (userId == null) return;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Instant now = Instant.now();
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.ofInstant(now, zoneId);

        if (user.getLastStudiedAt() == null) {
            user.setStreakCount(1);
            user.setLastStudiedAt(now);
        } else {
            LocalDate lastStudiedDate = LocalDate.ofInstant(user.getLastStudiedAt(), zoneId);
            long daysBetween = ChronoUnit.DAYS.between(lastStudiedDate, today);
            if (daysBetween == 1) {
                user.setStreakCount((user.getStreakCount() == null ? 0 : user.getStreakCount()) + 1);
                user.setLastStudiedAt(now);
            } else if (daysBetween > 1) {
                user.setStreakCount(1);
                user.setLastStudiedAt(now);
            } else if (daysBetween == 0) {
                // Already studied today, keep current streak but refresh timestamp
                user.setLastStudiedAt(now);
            }
        }
        userRepository.save(user);
    }

    private Integer calculateActiveStreak(User user) {
        if (user.getStreakCount() == null || user.getStreakCount() == 0 || user.getLastStudiedAt() == null) {
            return 0;
        }
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.ofInstant(Instant.now(), zoneId);
        LocalDate lastStudiedDate = LocalDate.ofInstant(user.getLastStudiedAt(), zoneId);
        long daysBetween = ChronoUnit.DAYS.between(lastStudiedDate, today);
        if (daysBetween > 1) {
            return 0; // Streak is broken
        }
        return user.getStreakCount();
    }

    @Override
    @Transactional
    public UserMeResponse updateEmail(Long userId, String newEmail) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy user với ID: " + userId));

        newEmail = newEmail.trim().toLowerCase();

        if (userRepository.findByEmailIgnoreCaseAndAuthType(newEmail, user.getAuthType()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
        }

        user.setEmail(newEmail);
        user.setEmailVerified(false);
        userRepository.save(user);

        var roles = user.getRoles().stream().map(r -> r.getRoleName()).sorted().toList();

        return UserMeResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .level(user.getLevel() != null ? user.getLevel().name() : null)
                .emailVerified(user.isEmailVerified())
                .status(user.getStatus() == null ? null : user.getStatus().name())
                .authType(user.getAuthType() == null ? null : user.getAuthType().name())
                .roles(roles)
                .streakCount(calculateActiveStreak(user))
                .lastStudiedAt(user.getLastStudiedAt())
                .build();
    }

    @Override
    @Transactional
    public void sendEmailVerification(Long userId, String verifyLinkBase) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy user với ID: " + userId));

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .email(user.getEmail())
                .token(token)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .used(false)
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        String verifyLink = verifyLinkBase + "?token=" + token;
        emailService.sendEmailVerificationEmail(user.getEmail(), token, verifyLink);
    }
}
