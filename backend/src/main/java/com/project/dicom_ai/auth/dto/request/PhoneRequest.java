package com.project.dicom_ai.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class PhoneRequest {
    @NotBlank(message = "phone is required")
    @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$",
            message = "invalid phone format")
    private String phone;
}
