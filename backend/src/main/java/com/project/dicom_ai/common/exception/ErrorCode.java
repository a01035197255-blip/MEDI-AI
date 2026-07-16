package com.project.dicom_ai.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    PATIENT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "Patient not found"),
    STUDY_NOT_FOUND(HttpStatus.NOT_FOUND, "S001", "Study not found"),
    SERIES_NOT_FOUND(HttpStatus.NOT_FOUND, "S002", "Series not found"),
    IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "I001", "Image not found"),
    // AUTH
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "A001", "Email already exists"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "A002", "User not found"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "A003", "Invalid password"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A006", "Invalid token"),

    // AUTH PHONE
    INVALID_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "A004", "Invalid verification code"),
    PHONE_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "A005", "Phone not verified"),
    UNSUPPORTED_OAUTH_PROVIDER(HttpStatus.BAD_REQUEST, "A008", "Unsupported OAuth provider"),
    OAUTH_EMAIL_NOT_FOUND(HttpStatus.BAD_REQUEST, "A007", "OAuth email not found"),

    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "A011", "Password does not match"),
    CURRENT_PASSWORD_INVALID(HttpStatus.UNAUTHORIZED, "A012", "Current password is incorrect"),

    // GENERAL
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G001", "Internal server error"),

    EXPIRED_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "A009", "Verification code expired"),

    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "A010", "Too many requests, please try again later"),

    // ===============================
    // AI Analysis
    // ===============================
    AI_ANALYSIS_NOT_FOUND(HttpStatus.NOT_FOUND, "A100", "AI analysis not found"),
    AI_ANALYSIS_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "A101", "AI analysis failed"),
    AI_ANALYSIS_RESULT_NOT_FOUND(HttpStatus.NOT_FOUND, "A102", "AI analysis result not found"),

    // ===============================
    // AI Overlay
    // ===============================
    AI_OVERLAY_NOT_FOUND(HttpStatus.NOT_FOUND, "A110", "AI overlay not found"),

    // ===============================
    // Secondary Capture
    // ===============================
    SECONDARY_CAPTURE_CREATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "A120", "Secondary Capture creation failed"),
    SECONDARY_CAPTURE_NOT_FOUND(HttpStatus.NOT_FOUND, "A121", "Secondary Capture not found"),

    // ===============================
    // DICOM
    // ===============================
    DICOM_CONVERT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "D004", "DICOM to PNG conversion failed"),
    DICOM_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "D001", "DICOM upload failed"),
    DICOM_NOT_FOUND(HttpStatus.NOT_FOUND, "D001", "Dicom file not found"),
    DICOM_ALREADY_EXISTS(HttpStatus.CONFLICT, "D002", "DICOM already exists"),
    DICOM_METADATA_READ_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "A130", "Failed to read DICOM metadata"),
    DICOM_READER_NOT_FOUND(HttpStatus.INTERNAL_SERVER_ERROR, "DICOM_008", "DICOM Image Reader를 찾을 수 없습니다."),
    GDCM_DECOMPRESS_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "DICOM_009", "GDCM 압축 해제에 실패했습니다."),
    DICOM_SC_SAVE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "A131", "Failed to save Secondary Capture DICOM file");

    private final HttpStatus status;
    private final String code;
    private final String message;
}