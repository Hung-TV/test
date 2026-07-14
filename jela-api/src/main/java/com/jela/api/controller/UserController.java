package com.jela.api.controller;

import com.jela.api.dto.request.UpdateProfileRequest;
import com.jela.api.dto.request.UpdateEmailRequest;
import com.jela.api.dto.response.UserMeResponse;
import com.jela.api.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile based on JWT.
     * JwtAuthenticationFilter sets principal = userId.
     */
    @GetMapping("/me")
    public UserMeResponse me(Authentication authentication) {
        Long userId = authentication == null ? null : (Long) authentication.getPrincipal();
        return userService.me(userId);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserMeResponse> updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        UserMeResponse updatedUser = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping("/me/email")
    public ResponseEntity<UserMeResponse> updateEmail(Authentication authentication, @Valid @RequestBody UpdateEmailRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        UserMeResponse updatedUser = userService.updateEmail(userId, request.getEmail());
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/me/email/verification")
    public ResponseEntity<String> sendEmailVerification(Authentication authentication, HttpServletRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        String requestUrl = request.getRequestURL().toString();
        String backendBaseUrl = requestUrl.replace(request.getRequestURI(), request.getContextPath());
        String verifyLink = backendBaseUrl + "/api/auth/verify-email";
        userService.sendEmailVerification(userId, verifyLink);
        return ResponseEntity.ok("Mã xác minh đã được gửi qua email.");
    }
}
