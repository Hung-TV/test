package com.jela.api.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties props;

    private SecretKey key() {
        byte[] keyBytes = Decoders.BASE64.decode(props.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String subject, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.getAccessTokenTtlSeconds());

        return Jwts.builder()
                .subject(subject)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key())
                .compact();
    }

    public JwtPayload parseAndValidate(String token) {
        var claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId = Long.parseLong(claims.getSubject());
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles", List.class);

        return new JwtPayload(userId, roles);
    }

    public record JwtPayload(Long userId, List<String> roles) {}
}
