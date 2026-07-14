package com.jela.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class JelaApiApplicationTests {

    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class FlywayDisabledTestConfig {

        @Bean(name = "flywayInitializer")
        Object flywayInitializer() {
            return new Object();
        }
    }
}
