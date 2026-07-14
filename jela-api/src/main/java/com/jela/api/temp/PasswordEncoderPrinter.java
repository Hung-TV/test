//package com.jela.api.temp;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//@Component
//@RequiredArgsConstructor
//public class PasswordEncoderPrinter implements CommandLineRunner {
//
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) throws Exception {
//        String rawPassword = "admin123";
//        String encodedPassword = passwordEncoder.encode(rawPassword);
//
//        System.out.println("====================================================================");
//        System.out.println("!!! HASH MẬT KHẨU MỚI CHO 'admin123' !!!");
//        System.out.println("SAO CHÉP DÒNG DƯỚI ĐÂY VÀ DÁN VÀO CỘT password_hash TRONG DATABASE:");
//        System.out.println(encodedPassword);
//        System.out.println("====================================================================");
//    }
//}
