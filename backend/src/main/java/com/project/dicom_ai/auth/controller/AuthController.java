package com.project.dicom_ai.auth.controller;

import com.project.dicom_ai.auth.dto.request.*;
import com.project.dicom_ai.auth.dto.response.LoginResponse;
import com.project.dicom_ai.auth.service.AuthService;
import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // =====================
    // register
    // =====================
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @RequestBody @Valid RegisterRequest req
    ) {
        authService.registerUser(req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // =====================
    // login
    // =====================
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody @Valid LoginRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(req)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody RefreshRequest req
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(authService.refresh(req))
        );
    }

    // =====================
    // logout (PRINCIPAL 사용)
    // =====================
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String token,
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.ok());
        }

        authService.logout(token, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // =====================
    // password reset send
    // =====================
    @PostMapping("/password/reset/send")
    public ResponseEntity<ApiResponse<Void>> sendCode(
            @RequestBody @Valid PhoneRequest req
    ) {
        authService.sendResetCode(req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // =====================
    // password reset verify
    // =====================
    @PostMapping("/password/reset/verify")
    public ResponseEntity<ApiResponse<Void>> verify(
            @RequestBody @Valid VerifyCodeRequest req
    ) {
        authService.verifyCode(req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // =====================
    // password reset
    // =====================
    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> reset(
            @RequestBody @Valid ResetPasswordRequest req
    ) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ChangePasswordRequest req
    ) {
        authService.changePassword(
                userDetails.getUserId(),
                req
        );

        return ResponseEntity.ok(ApiResponse.ok());
    }
}