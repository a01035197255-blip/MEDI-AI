package com.project.dicom_ai.analysis.dto;

import com.project.dicom_ai.analysis.entity.AiOverlay;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOverlayDto {

    private Long id;

    private Integer sliceIndex;

    private Double bboxX;
    private Double bboxY;
    private Double bboxW;
    private Double bboxH;

    private Double confidence;
    private String sopInstanceUid;
    private Long analysisId;

    private Long imageId;
    private String imageUrl;

    public static AiOverlayDto from(AiOverlay overlay){

        return AiOverlayDto.builder()
                .id(overlay.getId())
                .analysisId(overlay.getAnalysis().getId())
                .sliceIndex(overlay.getSliceIndex())
                .bboxX(overlay.getBboxX())
                .bboxY(overlay.getBboxY())
                .bboxW(overlay.getBboxW())
                .bboxH(overlay.getBboxH())
                .confidence(overlay.getConfidence())
                .imageId(overlay.getImage().getId())
                .imageUrl(
                        "/api/images/"
                                + overlay.getImage().getSopInstanceUid()
                )
                .build();
    }
}