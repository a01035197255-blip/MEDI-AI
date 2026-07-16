package com.project.dicom_ai.series.dto;

import com.project.dicom_ai.series.entity.BodyPart;
import com.project.dicom_ai.study.entity.Modality;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SeriesRequest {

    private String seriesInstanceUid;
    private Long studyId;
    private Modality modality;
    private BodyPart bodyPart;
}