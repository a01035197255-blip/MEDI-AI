package com.project.dicom_ai.dicom.controller;

import com.project.dicom_ai.common.response.ApiResponse;
import com.project.dicom_ai.common.security.CustomUserDetails;
import com.project.dicom_ai.dicom.dto.DicomFileResponse;
import com.project.dicom_ai.dicom.dto.DicomUploadResult;
import com.project.dicom_ai.dicom.service.DicomFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/dicom")
@RequiredArgsConstructor
public class DicomFileController {

    private final DicomFileService dicomFileService;


    // =========================
    // DICOM 업로드
    // =========================
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DicomUploadResult>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam("studyId") Long studyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws Exception {

        Long userId = userDetails.getUserId();

        DicomUploadResult response =
                dicomFileService.upload(file, patientId, studyId, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/upload/zip")
    public ResponseEntity<ApiResponse<List<DicomUploadResult>>> uploadZip(
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam("patientId") Long patientId,
            @RequestParam("studyId") Long studyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws Exception {

        Long userId = userDetails.getUserId();

        List<DicomUploadResult> response =
                dicomFileService.importZip(
                        zipFile,
                        patientId,
                        studyId,
                        userId
                );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // DICOM 다중 업로드
    // =========================
    @PostMapping("/upload/batch")
    public ResponseEntity<ApiResponse<List<DicomUploadResult>>> importDicom(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("patientId") Long patientId,
            @RequestParam("studyId") Long studyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        List<DicomUploadResult> response = dicomFileService.importDicom(
                        files,
                        patientId,
                        studyId,
                        userId
                );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // Study 기준 조회
    // =========================
    @GetMapping("/study/{studyUid}")
    public ResponseEntity<ApiResponse<List<DicomFileResponse>>> getByStudy(
            @PathVariable String studyUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        List<DicomFileResponse> response = dicomFileService.getByStudy(
                        studyUid,
                        userId
                );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // SOP Instance UID 조회
    // =========================
    @GetMapping("/uid/{sopInstanceUid}")
    public ResponseEntity<ApiResponse<DicomFileResponse>> getByUid(
            @PathVariable String sopInstanceUid,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        DicomFileResponse response = dicomFileService.findBySopInstanceUid(
                        sopInstanceUid,
                        userId
                );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // =========================
    // 단건 조회
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DicomFileResponse>> get(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long userId = userDetails.getUserId();

        DicomFileResponse response = dicomFileService.findDicomById(
                        id,
                        userId
                );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}