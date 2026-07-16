package com.project.dicom_ai.study.controller;

import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import com.project.dicom_ai.study.dto.StudyRequest;
import com.project.dicom_ai.study.dto.StudyResponse;
import com.project.dicom_ai.study.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/study")
public class StudyController {

    private final StudyService studyService;


    // =========================
    // 1. Study 생성
    // =========================
    @PostMapping
    public ResponseEntity<ApiResponse<StudyResponse>> submit(
            @RequestBody StudyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        StudyResponse response =
                studyService.submit(request, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    // =========================
    // 2. 환자별 Study 조회
    // =========================
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<StudyResponse>>> getByPatientId(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(studyService.findByPatientId(patientId, userId)));
    }

    // =========================
    // 3. studyInstanceUid 조회
    // =========================
    @GetMapping("/{studyInstanceUid}")
    public ResponseEntity<ApiResponse<StudyResponse>> getByUid(
            @PathVariable String studyInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        studyService.getByStudyInstanceUid(studyInstanceUid, userId)));
    }

    // =========================
    // 4. 내 Study 목록
    // =========================
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyResponse>>> findAllStudies(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(studyService.findAllStudies(userId)));
    }
}