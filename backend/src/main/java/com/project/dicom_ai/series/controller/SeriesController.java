package com.project.dicom_ai.series.controller;

import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import com.project.dicom_ai.series.dto.SeriesRequest;
import com.project.dicom_ai.series.dto.SeriesResponse;
import com.project.dicom_ai.series.service.SeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    // =========================
    // Series 생성
    // =========================
    @PostMapping("/studies/{studyInstanceUid}")
    public ResponseEntity<ApiResponse<SeriesResponse>> create(
            @PathVariable String studyInstanceUid,
            @RequestBody SeriesRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        SeriesResponse response = seriesService.create(studyInstanceUid, request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response));
    }

    // =========================
    // Study UID 기준 Series 조회
    // =========================
    @GetMapping("/studies/{studyInstanceUid}")
    public ResponseEntity<ApiResponse<List<SeriesResponse>>> getByStudyInstanceUid(
            @PathVariable String studyInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        List<SeriesResponse> response = seriesService.getByStudyInstanceUid(studyInstanceUid, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // Study PK 기준 Series 조회
    // =========================
    @GetMapping("/study/{studyId}")
    public ResponseEntity<ApiResponse<List<SeriesResponse>>> getByStudy(
            @PathVariable Long studyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        List<SeriesResponse> response = seriesService.getByStudyId(studyId, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // Series 단건 조회
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeriesResponse>> get(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();
        SeriesResponse response = seriesService.get(id, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}