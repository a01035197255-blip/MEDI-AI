package com.project.dicom_ai.analysis.controller;

import com.project.dicom_ai.analysis.dto.*;
import com.project.dicom_ai.analysis.entity.AnalysisStatus;
import com.project.dicom_ai.analysis.service.AiAnalysisService;
import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analysis")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;


    // ===============================
    // AI 분석 요청
    // ===============================
    @PostMapping("/study/{studyInstanceUid}/series/{seriesInstanceUid}")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> requestAnalysis(
            @PathVariable String studyInstanceUid,
            @PathVariable String seriesInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(aiAnalysisService.requestAnalysis(studyInstanceUid, userId, seriesInstanceUid)));
    }
    // ===============================
    // 분석 상태 조회
    // ===============================
    @GetMapping("/{analysisId}/status")
    public ResponseEntity<ApiResponse<AnalysisStatus>> getAnalysisStatus(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.getAnalysisStatus(
                                analysisId,
                                userId))
        );
    }

    @GetMapping("/study/{studyInstanceUid}")
    public ResponseEntity<ApiResponse<List<AiOverlayDto>>> getOverlays(
            @PathVariable String studyInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Long userId = userDetails.getUserId();

        List<AiOverlayDto> overlays = aiAnalysisService.getOverlays(
                        studyInstanceUid,
                        userId
                );

        return ResponseEntity.ok(
                ApiResponse.ok(overlays)
        );
    }

    // ===============================
    // 분석 결과 조회
    // ===============================
    @GetMapping("/{analysisId}")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getAnalysisResult(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.getAnalysisResult(
                                analysisId,
                                userId))
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AiAnalysisResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.getAllAnalysis(userId)
                )
        );
    }

    // ===============================
    // 이전 검사 비교
    // ===============================
    @GetMapping("/compare")
    public ResponseEntity<ApiResponse<CompareAnalysisResponse>> compareAnalysis(
            @RequestParam Long currentId,
            @RequestParam Long previousId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.compareAnalysisResult(
                                currentId,
                                previousId,
                                userId))
        );
    }

    // ===============================
    // 환자 AI 분석 이력
    // ===============================
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<ApiResponse<List<AiAnalysisResponse>>> getHistory(
            @PathVariable Long patientId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.getAnalysisHistory(
                                patientId,
                                userId))
        );
    }

    // ===============================
    // Secondary Capture 생성
    // ===============================
    @PostMapping("/{analysisId}/secondary-capture")
    public ResponseEntity<ApiResponse<SCResponse>> generateSecondaryCapture(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.generateSecondaryCapture(
                                analysisId,
                                userId))
        );
    }

    // ===============================
    // Secondary Capture 목록
    // ===============================
    @GetMapping("/{analysisId}/secondary-captures")
    public ResponseEntity<ApiResponse<List<SCResponse>>> listSecondaryCaptures(
            @PathVariable Long analysisId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.listSecondaryCaptures(
                                analysisId,
                                userId))
        );
    }

    // ===============================
    // Secondary Capture 단건
    // ===============================
    @GetMapping("/secondary-capture/{scId}")
    public ResponseEntity<ApiResponse<SCResponse>> getSecondaryCapture(
            @PathVariable Long scId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        return ResponseEntity.ok(
                ApiResponse.ok(
                        aiAnalysisService.getSecondaryCapture(
                                scId,
                                userId))
        );
    }
}