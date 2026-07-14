package com.jela.api.service.impl;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AuthResponse;
import com.jela.api.entity.PasswordResetToken;
import com.jela.api.entity.RefreshToken;
import com.jela.api.entity.Role;
import com.jela.api.entity.User;
import com.jela.api.enums.AuthType;
import com.jela.api.enums.Level;
import com.jela.api.enums.UserStatus;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.PasswordResetTokenRepository;
import com.jela.api.repository.RefreshTokenRepository;
import com.jela.api.repository.RoleRepository;
import com.jela.api.repository.UserRepository;
import com.jela.api.security.JwtProperties;
import com.jela.api.security.JwtService;
import com.jela.api.service.AuthService;
import com.jela.api.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.jela.api.entity.EmailVerificationToken;
import com.jela.api.repository.EmailVerificationTokenRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final EmailService emailService;
    private final com.jela.api.service.AdminSettingsService adminSettingsService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!adminSettingsService.getSettings().isAllowRegistration()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Đăng ký tài khoản mới hiện đang bị tắt bởi Quản trị viên.");
        }

        if (userRepository.existsByEmailIgnoreCaseAndAuthType(request.getEmail(), AuthType.LOCAL)) {
            throw new ApiException(HttpStatus.CONFLICT, "Tài khoản với email này đã được đăng ký bằng mật khẩu.");
        }

        Role userRole = roleRepository.findByRoleName("LEARNER")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Thiếu role LEARNER trong DB"));

        User user = User.builder()
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .level(request.getLevel())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .authType(AuthType.LOCAL)
                .build();
        user.getRoles().add(userRole);

        userRepository.save(user);
        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCaseAndAuthType(request.getEmail(), AuthType.LOCAL)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        if (!adminSettingsService.getSettings().isAllowGoogleLogin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Đăng nhập bằng Google hiện đang bị tắt bởi Quản trị viên.");
        }

        User user = verifyGoogleIdTokenAndUpsertUser(request.getIdToken());
        return issueTokens(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCaseAndAuthType(request.getEmail(), AuthType.LOCAL)
                .orElse(null); // Don't throw error to prevent email enumeration attacks

        if (user != null) {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES)) // 15 minutes validity
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và mật khẩu xác nhận không khớp.");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận không hợp lệ hoặc đã hết hạn."));

        if (resetToken.isUsed()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận này đã được sử dụng.");
        }

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận đã hết hạn.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và mật khẩu xác nhận không khớp.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));

        if (user.getAuthType() != AuthType.LOCAL || user.getPasswordHash() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tài khoản này không hỗ trợ đổi mật khẩu.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User verifyGoogleIdTokenAndUpsertUser(String token) {
        if (token == null || token.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Google token must not be null or empty.");
        }

        String email = null;
        String fullName = null;
        String avatarUrl = null;

        // If it looks like a JWT (contains three parts separated by dots)
        if (token.contains(".") && token.split("\\.").length == 3) {
            try {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .build(); // No audience check so that it can verify tokens generated by web, android, or ios clients

                GoogleIdToken idToken = verifier.verify(token);
                if (idToken != null) {
                    GoogleIdToken.Payload googlePayload = idToken.getPayload();
                    email = googlePayload.getEmail();
                    boolean emailVerified = googlePayload.getEmailVerified();
                    if (email == null || !emailVerified) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Google account email is not verified or missing.");
                    }
                    fullName = (String) googlePayload.get("name");
                    avatarUrl = (String) googlePayload.get("picture");
                } else {
                    throw new ApiException(HttpStatus.UNAUTHORIZED, "The provided Google ID Token is invalid or expired.");
                }
            } catch (ApiException e) {
                throw e;
            } catch (Exception e) {
                logger.error("Error verifying Google ID token", e);
                throw new ApiException(HttpStatus.UNAUTHORIZED, "The provided Google ID Token could not be verified.");
            }
        } else {
            // Otherwise verify as Access Token using Google UserInfo API
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(token);
                HttpEntity<String> entity = new HttpEntity<>("", headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        HttpMethod.GET,
                        entity,
                        Map.class
                );

                Map<String, Object> payload = response.getBody();
                if (payload == null) {
                    throw new ApiException(HttpStatus.UNAUTHORIZED, "The provided Google access token is invalid.");
                }

                email = (String) payload.get("email");
                Boolean emailVerified = (Boolean) payload.get("email_verified");

                if (email == null || (emailVerified != null && !emailVerified)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Google account email is not verified or missing.");
                }

                fullName = (String) payload.get("name");
                avatarUrl = (String) payload.get("picture");

            } catch (Exception e) {
                logger.error("Error fetching user info from Google. Access token might be invalid or expired.", e);
                throw new ApiException(HttpStatus.UNAUTHORIZED, "The provided Google token could not be verified.");
            }
        }

        final String finalEmail = email;
        final String finalFullName = fullName;
        final String finalAvatarUrl = avatarUrl;

        User user = userRepository.findByEmailIgnoreCaseAndAuthType(email, AuthType.GOOGLE)
                .orElseGet(() -> {
                    Role userRole = roleRepository.findByRoleName("LEARNER")
                            .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Thiếu role LEARNER trong DB"));

                    User newUser = User.builder()
                            .email(finalEmail)
                            .fullName(finalFullName)
                            .avatarUrl(finalAvatarUrl)
                            .authType(AuthType.GOOGLE)
                            .emailVerified(true)
                            .status(UserStatus.ACTIVE)
                            .level(Level.BEGINNER)
                            .build();
                    newUser.getRoles().add(userRole);
                    return newUser;
                });

        user.setFullName(fullName);
        user.setAvatarUrl(avatarUrl);

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void verifyEmailToken(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận không hợp lệ."));

        if (verificationToken.isUsed()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận này đã được sử dụng.");
        }

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã xác nhận đã hết hạn.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailVerificationTokenRepository.save(verificationToken);
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));

        if (rt.isRevoked()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token đã bị thu hồi");
        }

        if (rt.getExpiryDate().isBefore(Instant.now())) {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token đã hết hạn");
        }

        rt.setRevoked(true);
        refreshTokenRepository.save(rt);

        User user = rt.getUser();
        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    private AuthResponse issueTokens(User user) {
        List<String> roles = user.getRoles().stream().map(Role::getRoleName).sorted().toList();
        String accessToken = jwtService.generateAccessToken(user.getUserId().toString(), roles);

        String newRefreshTokenValue = randomToken();
        Instant refreshExp = Instant.now().plus(jwtProperties.getRefreshTokenTtlDays(), ChronoUnit.DAYS);
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenValue)
                .expiryDate(refreshExp)
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshTokenValue)
                .expiresInSeconds(jwtProperties.getAccessTokenTtlSeconds())
                .user(AuthResponse.UserResponse.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .roles(roles)
                        .build())
                .build();
    }

    private String randomToken() {
        byte[] bytes = new byte[64];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
