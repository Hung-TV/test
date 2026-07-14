package com.jela.api.service.impl;

import com.jela.api.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${client.url}")
    private String clientUrl;

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Yêu cầu đặt lại mật khẩu - JELA App");
            
            String resetLink = clientUrl + "/reset-password?token=" + token;

            String text = "Chào bạn,\n\n"
                    + "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản JELA của mình.\n"
                    + "Mã xác nhận (Token) của bạn là: \n\n"
                    + token + "\n\n"
                    + "Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:\n"
                    + resetLink + "\n\n"
                    + "Mã này và liên kết sẽ hết hạn sau 15 phút.\n"
                    + "Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.\n\n"
                    + "Trân trọng,\nĐội ngũ JELA";
            
            message.setText(text);
            emailSender.send(message);
            log.info("Đã gửi email khôi phục mật khẩu đến: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email khôi phục mật khẩu đến {}: {}", to, e.getMessage());
            // You might want to throw a custom exception here or just log it
            // depending on how strict you want the email sending requirement to be
        }
    }

    @Override
    public void sendEmailVerificationEmail(String to, String token, String verifyLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Xác thực địa chỉ Email - JELA App");

            String text = "Chào bạn,\n\n"
                    + "Cảm ơn bạn đã đăng ký hoặc cập nhật email trên ứng dụng JELA.\n"
                    + "Mã xác thực của bạn là: \n\n"
                    + token + "\n\n"
                    + "Nếu bạn đang sử dụng website, vui lòng nhấp vào liên kết sau để xác thực email của bạn:\n"
                    + verifyLink + "\n\n"
                    + "Nếu bạn đang sử dụng ứng dụng di động, vui lòng sao chép Mã xác thực ở trên và nhập vào ứng dụng.\n\n"
                    + "Mã này sẽ hết hạn sau 24 giờ.\n"
                    + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                    + "Trân trọng,\nĐội ngũ JELA";

            message.setText(text);
            emailSender.send(message);
            log.info("Đã gửi email xác thực đến: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác thực đến {}: {}", to, e.getMessage());
        }
    }
}
