package com.project.dicom_ai.analysis.controller;

import com.project.dicom_ai.analysis.dto.ViewerResponse;
import com.project.dicom_ai.analysis.service.ViewerService;
import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/viewer")
public class ViewerController {


    private final ViewerService viewerService;


    @GetMapping("/{studyInstanceUid}/{seriesInstanceUid}")
    public ResponseEntity<ApiResponse<ViewerResponse>> getViewer(
            @PathVariable String studyInstanceUid,
            @PathVariable String seriesInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        ViewerResponse viewer = viewerService.getViewer(
                        studyInstanceUid,
                        seriesInstanceUid,
                        userDetails.getUserId()
                );

        return ResponseEntity.ok(ApiResponse.ok(viewer));
    }
}