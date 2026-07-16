package com.project.dicom_ai.analysis.dto;

import com.project.dicom_ai.analysis.entity.AiOverlay;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SCResponse {

    private Long scId;

    private Long analysisId;

    private String imagePath;

    private Integer sliceIndex;

    public static SCResponse from(AiOverlay overlay) {

        return SCResponse.builder()
                .scId(overlay.getId())
                .analysisId(overlay.getAnalysis().getId())
                .imagePath("/dicom/sc/AI_SC_" + overlay.getAnalysis().getId() + ".dcm")
                .sliceIndex(overlay.getSliceIndex())
                .build();
    }
}