package com.project.dicom_ai.series.dto;

import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.study.entity.Modality;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SeriesResponse {

    private Long id;
    private String seriesInstanceUid;
    private Modality modality;
    private String bodyPart;
    private Long studyId;

    // =========================
    // Entity → DTO 변환 (from)
    // =========================
    public static SeriesResponse from(Series series) {
        return SeriesResponse.builder()
                .id(series.getId())
                .seriesInstanceUid(series.getSeriesInstanceUid())
                .modality(series.getStudy().getModality())
                .bodyPart(series.getBodyPart().name())
                .studyId(series.getStudy().getId())
                .build();
    }
}