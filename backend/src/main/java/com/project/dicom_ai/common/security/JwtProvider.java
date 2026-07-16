package com.project.dicom_ai.common.security;

import com.project.dicom_ai.auth.domain.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    private final long ACCESS_EXP = 1000 * 60 * 30; // 30분
    private final long REFRESH_EXP = 1000 * 60 * 60 * 24 * 7; // 7일

    // key 생성 (핵심)
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // =====================
    // ACCESS TOKEN
    // =====================
    public String createAccessToken(User user) {

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXP))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =====================
    // REFRESH TOKEN
    // =====================
    public String createRefreshToken(User user) {

        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXP))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // =====================
    // PARSE
    // =====================
    public Claims parse(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =====================
    // EMAIL
    // =====================
    public String getEmail(String token) {
        return parse(token).getSubject();
    }

    // =====================
    // ROLE
    // =====================
    public String getRole(String token) {
        return parse(token).get("role", String.class);
    }

    // =====================
    // EXPIRED CHECK
    // =====================
    public boolean isExpired(String token) {
        return parse(token).getExpiration().before(new Date());
    }
}