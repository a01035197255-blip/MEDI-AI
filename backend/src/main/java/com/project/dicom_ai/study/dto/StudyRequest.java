package com.project.dicom_ai.study.dto;

import com.project.dicom_ai.study.entity.Modality;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudyRequest {

    private Long id;
    private Long patientId;
    private Modality modality;
    private LocalDate studyDate;
    private String description;

}