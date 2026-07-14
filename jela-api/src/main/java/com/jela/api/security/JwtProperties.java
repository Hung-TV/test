package com.jela.api.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    /** base64 string */
    private String secret;
    private long accessTokenTtlSeconds;
    private long refreshTokenTtlDays;
}

