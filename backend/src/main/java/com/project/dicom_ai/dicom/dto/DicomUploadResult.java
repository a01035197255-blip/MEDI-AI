package com.project.dicom_ai.dicom.dto;

import com.project.dicom_ai.image.entity.ImageType;
import com.project.dicom_ai.patient.entity.Gender;
import com.project.dicom_ai.series.entity.BodyPart;
import com.project.dicom_ai.study.entity.Modality;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DicomUploadResult {

    // =========================
    // FILE INFO
    // =========================
    private String filePath;
    private String originalFilename;

    // =========================
    // PATIENT
    // =========================
    private String patientIdentifier;
    private String patientName;
    private LocalDate patientBirthDate;
    private Gender patientSex;

    // =========================
    // STUDY
    // =========================
    private String studyInstanceUid;
    private LocalDate studyDate;
    private String studyTime;
    private Modality modality;
    private String studyDescription;

    // =========================
    // SERIES
    // =========================
    private String seriesInstanceUid;
    private Integer seriesNumber;
    private String seriesDescription;
    private BodyPart bodyPart;

    private String pngPath;

    // =========================
    // IMAGE (INSTANCE)
    // =========================
    private String sopInstanceUid;
    private String sopClassUid;
    private ImageType imageType;
    private Integer instanceNumber;

    // =========================
    // IMAGE METADATA (VIEWER)
    // =========================
    private Integer rows;
    private Integer columns;

    private Double windowCenter;
    private Double windowWidth;

    private Double pixelSpacingX;
    private Double pixelSpacingY;

    private Double rescaleSlope;
    private Double rescaleIntercept;
}