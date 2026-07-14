package com.jela.api.controller;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AuthResponse;
import com.jela.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.jela.api.service.AdminSettingsService adminSettingsService;

    @Value("${client.url}")
    private String clientUrl;

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmailToken(token);
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(java.net.URI.create(clientUrl + "/settings?verificationSuccess=true"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (Exception e) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(java.net.URI.create(clientUrl + "/settings?verificationSuccess=false"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    @GetMapping("/settings")
    public com.jela.api.dto.SystemSettingsDto getSettings() {
        return adminSettingsService.getSettings();
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Nếu email hợp lệ, một mã xác nhận đã được gửi.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
    }

    @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        authService.changePassword(userId, request);
        return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.getRefreshToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}
