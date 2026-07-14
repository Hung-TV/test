package com.jela.api.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
    void sendEmailVerificationEmail(String to, String token, String verifyLink);
}
