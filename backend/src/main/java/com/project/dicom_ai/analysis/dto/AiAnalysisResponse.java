package com.project.dicom_ai.analysis.dto;

import com.project.dicom_ai.analysis.entity.AiAnalysis;
import com.project.dicom_ai.analysis.entity.AnalysisStatus;
import com.project.dicom_ai.analysis.entity.DiagnosisResult;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AiAnalysisResponse {

    private Long id;
    private Long studyId;
    private Long patientId;
    private String overallImpression;
    private String modelName;
    private String modelVersion;
    private Long processingTimeMs;
    private AnalysisStatus status;
    private DiagnosisResult diagnosisResult;
    private String studyInstanceUid;
    private String seriesInstanceUid;
    private String patientIdentifier;
    private String patientName;
    private LocalDateTime createdAt;
    private List<AiFindingDto> findings;
    private List<AiOverlayDto> overlays;

    public static AiAnalysisResponse from(AiAnalysis analysis) {
        return AiAnalysisResponse.builder()
                .id(analysis.getId())
                .studyId(analysis.getStudy().getId())
                .patientId(analysis.getPatient().getId())
                .studyInstanceUid(analysis.getStudy().getStudyInstanceUid())
                .seriesInstanceUid(analysis.getSeries().getSeriesInstanceUid())
                .patientIdentifier(analysis.getPatient().getPatientIdentifier())
                .patientName(analysis.getPatient().getName())
                .overallImpression(analysis.getOverallImpression())
                .modelName(analysis.getModelName())
                .modelVersion(analysis.getModelVersion())
                .processingTimeMs(analysis.getProcessingTimeMs())
                .status(analysis.getStatus())
                .diagnosisResult(analysis.getDiagnosisResult())
                .createdAt(analysis.getCreatedAt())
                .findings(analysis.getFindings().stream().map(AiFindingDto::from).toList())
                .overlays(analysis.getOverlays().stream().map(AiOverlayDto::from).toList())
                .build();
    }
}