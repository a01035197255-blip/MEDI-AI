package com.project.dicom_ai.patient.dto;

import com.project.dicom_ai.patient.entity.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PatientRequest {

    private Long id;
    private String name;
    private LocalDate birthDate;
    private Gender gender;
    private String phone;

}