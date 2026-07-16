package com.project.dicom_ai.analysis.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompareAnalysisResponse {

    private String current;

    private String previous;

    private String change;
}