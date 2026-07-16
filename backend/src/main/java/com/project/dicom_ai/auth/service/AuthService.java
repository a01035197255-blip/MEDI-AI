package com.project.dicom_ai.auth.service;

import com.project.dicom_ai.auth.domain.Role;
import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.auth.dto.request.*;
import com.project.dicom_ai.auth.dto.response.LoginResponse;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.common.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final SmsService smsService;

    // =====================
    // registerUser
    // =====================
    public void registerUser(RegisterRequest req) {

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.DOCTOR)
                .build();

        userRepository.save(user);
    }

    // =====================
    // login
    // =====================
    public LoginResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));


        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);

        redisTemplate.opsForValue().set(
                user.getEmail(),
                refreshToken,
                Duration.ofDays(7)
        );

        return new LoginResponse(accessToken, refreshToken);
    }

    public LoginResponse refresh(RefreshRequest req) {

        String refreshToken = req.refreshToken();

        // 1. 검증
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        String email = jwtProvider.getEmail(refreshToken);

        // 2. Redis에서 진짜 토큰인지 확인
        String savedToken = redisTemplate.opsForValue().get(email);

        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 3. 새 토큰 발급
        String newAccess = jwtProvider.createAccessToken(user);
        String newRefresh = jwtProvider.createRefreshToken(user);

        // 4. Redis 업데이트 (rotate)
        redisTemplate.opsForValue().set(
                email,
                newRefresh,
                Duration.ofDays(7)
        );

        return new LoginResponse(newAccess, newRefresh);
    }

    // =====================
    // logout
    // =====================
    public void logout(String accessToken, String email) {

        redisTemplate.delete(email);

        // 🔥 핵심: Bearer 제거
        String token = accessToken
                .replace("Bearer ", "")
                .replace(" ", "")
                .trim();

        long expire = jwtProvider.parse(token)
                .getExpiration()
                .getTime() - System.currentTimeMillis();

        redisTemplate.opsForValue().set(
                "BL:" + token,
                "logout",
                Duration.ofMillis(expire)
        );
    }

    // =====================
    // 1. 인증번호 발송
    // =====================
    public void sendResetCode(PhoneRequest req) {

        String phone = req.getPhone();

        // 1. 재전송 방지 (1분)
        String cooldownKey = "PWD_RESET_COOLDOWN:" + phone;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS);
        }

        // 2. 인증번호 생성
        String code = String.valueOf((int)(Math.random() * 900000) + 100000);

        // 3. Redis 저장 (5분)
        redisTemplate.opsForValue().set(
                "PWD_RESET:" + phone,
                code,
                Duration.ofMinutes(5)
        );

        // 4. 쿨다운 설정 (1분)
        redisTemplate.opsForValue().set(
                cooldownKey,
                "true",
                Duration.ofMinutes(1)
        );

        // 5. SMS 전송 (여기 추가)
        smsService.sendCode(phone, code);
    }

    // =====================
    // 2. 인증 확인
    // =====================
    public void verifyCode(VerifyCodeRequest req) {

        String phone = req.getPhone();
        String code = req.getCode();

        String saved = redisTemplate.opsForValue().get("PWD_RESET:" + phone);

        if (saved == null) {
            throw new BusinessException(ErrorCode.EXPIRED_VERIFICATION_CODE);
        }

        if (!saved.equals(code)) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        // 인증 완료
        redisTemplate.opsForValue().set(
                "PWD_RESET_VERIFIED:" + phone,
                "true",
                Duration.ofMinutes(10)
        );

        // 코드 삭제
        redisTemplate.delete("PWD_RESET:" + phone);
    }

    // =====================
    // 3. 비밀번호 변경
    // =====================
    public void resetPassword(ResetPasswordRequest req) {

        String phone = req.getPhone();
        String newPassword = req.getNewPassword();

        String verifiedKey = "PWD_RESET_VERIFIED:" + phone;

        String verified = redisTemplate.opsForValue().get(verifiedKey);

        if (!"true".equals(verified)) {
            throw new BusinessException(ErrorCode.PHONE_NOT_VERIFIED);
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 인증 1회용 처리
        redisTemplate.delete(verifiedKey);
    }

    public void changePassword(
            Long userId,
            ChangePasswordRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));


        // 기존 비밀번호 확인
        if(!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }
        // 새 비밀번호 확인
        if(!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }
        // 변경
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );
        userRepository.save(user);
    }
}

