package com.jela.api.service;

import com.jela.api.dto.request.UpdateProfileRequest;
import com.jela.api.dto.response.UserMeResponse;

public interface UserService {
    UserMeResponse me(Long userId);
    UserMeResponse updateProfile(Long userId, UpdateProfileRequest request);
    void updateStreak(Long userId);
    UserMeResponse updateEmail(Long userId, String newEmail);
    void sendEmailVerification(Long userId, String verifyLinkBase);
}
