package com.project.dicom_ai.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ResetPasswordRequest {
    @NotBlank(message = "phone is required")
    private String phone;
    @NotBlank(message = "password is required")
    @Size(min = 8, max = 20, message = "password must be 8~20 characters")
    private String newPassword;
}
