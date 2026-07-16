package com.project.dicom_ai.image.controller;

import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import com.project.dicom_ai.image.dto.ImageRequest;
import com.project.dicom_ai.image.dto.ImageResponse;
import com.project.dicom_ai.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    // =========================
    // Image 생성 (DICOM 업로드)
    // =========================
    @PostMapping
    public ResponseEntity<ApiResponse<ImageResponse>> create(
            @RequestBody ImageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        ImageResponse response = imageService.create(request, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // Series 기준 Image 조회 (뷰어 핵심 API)
    // =========================
    @GetMapping("/series/{seriesId}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getSeriesImages(
            @PathVariable Long seriesId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        List<ImageResponse> response = imageService.getSeriesImages(seriesId, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // SOP Instance UID 기준 조회
    // =========================
    @GetMapping("/uid/{sopInstanceUid}")
    public ResponseEntity<ApiResponse<ImageResponse>> getByUid(
            @PathVariable String sopInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        ImageResponse response = imageService.getBySopInstanceUid(sopInstanceUid, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // Image 단건 조회
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageResponse>> get(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        ImageResponse response = imageService.get(id, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/file/{sopInstanceUid}")
    public ResponseEntity<Resource> getDicomFile(
            @PathVariable String sopInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        Resource resource =
                imageService.getDicomFile(sopInstanceUid, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/dicom"))
                .body(resource);
    }
}