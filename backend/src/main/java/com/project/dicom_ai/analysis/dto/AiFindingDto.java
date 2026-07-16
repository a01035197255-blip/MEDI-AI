package com.project.dicom_ai.analysis.dto;

import com.project.dicom_ai.analysis.entity.AiFinding;
import com.project.dicom_ai.analysis.entity.RiskLevel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiFindingDto {

    private Integer sliceIndex;

    private String label;
    private String labelKo;

    private String description;

    private Double confidence;

    private RiskLevel riskLevel;

    public static AiFindingDto from(AiFinding finding){

        return AiFindingDto.builder()
                .sliceIndex(finding.getSliceIndex())
                .label(finding.getLabel())
                .labelKo(finding.getLabelKo())
                .description(finding.getDescription())
                .confidence(finding.getConfidence())
                .riskLevel(finding.getRiskLevel())
                .build();
    }
}