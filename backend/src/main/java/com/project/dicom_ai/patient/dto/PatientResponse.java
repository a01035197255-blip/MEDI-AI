package com.project.dicom_ai.patient.dto;

import com.project.dicom_ai.patient.entity.Gender;
import com.project.dicom_ai.patient.entity.Patient;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class PatientResponse {

    private Long id;
    private String patientIdentifier;
    private String name;
    private LocalDate birthDate;
    private String phone;
    private Gender gender;
    private Integer age;
    private LocalDateTime createdAt;

    // =========================
    // from 변환
    // =========================
    public static PatientResponse from(Patient a) {
        return PatientResponse.builder()
                .id(a.getId())
                .patientIdentifier(a.getPatientIdentifier())
                .name(a.getName())
                .phone(a.getPhone())
                .birthDate(a.getBirthDate())
                .age(a.getAge())
                .gender(a.getGender())
                .createdAt(a.getCreatedAt())
                .build();
    }
}