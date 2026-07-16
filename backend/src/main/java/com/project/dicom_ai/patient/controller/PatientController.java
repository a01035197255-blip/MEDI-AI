package com.project.dicom_ai.patient.controller;

import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import com.project.dicom_ai.patient.dto.PatientRequest;
import com.project.dicom_ai.patient.dto.PatientResponse;
import com.project.dicom_ai.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    // =========================
    // 1. 환자 등록
    // =========================
    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> submit(
            @RequestBody PatientRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = ((CustomUserDetails) userDetails).getUserId();

        PatientResponse response = patientService.submit(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    // =========================
    // 2. patientIdentifier 조회
    // =========================
    @GetMapping("/identifier/{patientIdentifier}")
    public ResponseEntity<ApiResponse<PatientResponse>> findByPatientIdentifier(
            @PathVariable String patientIdentifier,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = ((CustomUserDetails) userDetails).getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        patientService.getByPatientId(patientIdentifier, userId)
                )
        );
    }

    // PK로 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = ((CustomUserDetails) userDetails).getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        patientService.getById(id, userId)
                )
        );
    }

    // =========================
    // 전체 조회
    // =========================
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResponse>>> findAllPatients(
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = ((CustomUserDetails) userDetails).getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        patientService.findAllPatients(userId)
                )
        );
    }

    // =========================
    // 검색
    // =========================
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientResponse>>> searchPatients(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = ((CustomUserDetails) userDetails).getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        patientService.searchPatients(keyword, userId)
                )
        );
    }
}