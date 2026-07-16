package com.project.dicom_ai.study.dto;

import com.project.dicom_ai.patient.entity.Gender;
import com.project.dicom_ai.series.dto.SeriesResponse;
import com.project.dicom_ai.study.entity.Modality;
import com.project.dicom_ai.study.entity.Status;
import com.project.dicom_ai.study.entity.Study;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class StudyResponse {

    private Long id;

    private String studyInstanceUid;
    private Modality modality;
    private LocalDate studyDate;
    private String description;
    private Status status;

    // Patient 정보
    private Long patientId;
    private String patientIdentifier;
    private String patientName;
    private LocalDate patientBirthDate;
    private Integer patientAge;
    private Gender patientSex;
    private String patientPhone;

    private List<SeriesResponse> series;

    public static StudyResponse from(Study study) {
        return StudyResponse.builder()
                .id(study.getId())
                .studyInstanceUid(study.getStudyInstanceUid())
                .modality(study.getModality())
                .studyDate(study.getStudyDate())
                .description(study.getDescription())
                .status(study.getStatus())
                // Patient
                .patientId(study.getPatient().getId())
                .patientIdentifier(study.getPatient().getPatientIdentifier())
                .patientName(study.getPatient().getName())
                .patientPhone(study.getPatient().getPhone())
                .patientBirthDate(study.getPatient().getBirthDate())
                .patientAge(study.getPatient().getAge())
                .patientSex(study.getPatient().getGender())

                .build();
    }
}