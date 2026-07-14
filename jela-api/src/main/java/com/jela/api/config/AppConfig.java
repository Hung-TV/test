package com.jela.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        // Cung cấp một bean ObjectMapper cho toàn bộ ứng dụng
        // để Spring có thể inject nó vào các service khác.
        return new ObjectMapper();
    }
}
