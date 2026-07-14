package com.jela.api.service;

import com.jela.api.dto.request.ChangePasswordRequest;
import com.jela.api.dto.request.ForgotPasswordRequest;
import com.jela.api.dto.request.GoogleLoginRequest;
import com.jela.api.dto.request.LoginRequest;
import com.jela.api.dto.request.RegisterRequest;
import com.jela.api.dto.request.ResetPasswordRequest;
import com.jela.api.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);

    AuthResponse googleLogin(GoogleLoginRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void verifyEmailToken(String token);
}
