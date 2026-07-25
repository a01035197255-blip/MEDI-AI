package com.project.dicom_ai.auth.oauth2.handler;

import com.project.dicom_ai.auth.domain.Role;
import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) oAuth2User.getAttribute("email");
        String name = (String) attributes.get("name");

        if (email == null) {
            throw new BusinessException(ErrorCode.OAUTH_EMAIL_NOT_FOUND);
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name != null ? name : "OAUTH_USER")
                                .password("OAUTH2")
                                .role(Role.DOCTOR) // ✔ USER 없으니까 DOCTOR로 통일
                                .build()
                ));

        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);

        redisTemplate.opsForValue().set(
                user.getEmail(),
                refreshToken,
                Duration.ofDays(7)
        );

        String redirectUrl =
                "http://MEDIAI-env-1.eba-pfkrsuzy.ap-northeast-2.elasticbeanstalk.com/oauth2/redirect"
                        + "?accessToken=" + accessToken
                        + "&refreshToken=" + refreshToken;

        response.sendRedirect(redirectUrl);
    }
}