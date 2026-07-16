package com.project.dicom_ai.image.dto;

import com.project.dicom_ai.image.entity.ImageType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ImageRequest {

    // =========================
    // DICOM IDENTIFIER
    // =========================
    private String sopInstanceUid;
    private Long seriesId;
    private ImageType imageType;

    // =========================
    // FILE INFO
    // =========================
    private String filePath;
    private String originalFilename;

    // =========================
    // ORDERING
    // =========================
    private Integer instanceNumber;

    // =========================
    // VIEWER (WINDOW LEVEL)
    // =========================
    private Double windowCenter;
    private Double windowWidth;

    // =========================
    // CT / AI CORE METADATA
    // =========================
    private Integer rows;
    private Integer columns;

    private Double pixelSpacingX;
    private Double pixelSpacingY;

    private Double rescaleSlope;
    private Double rescaleIntercept;
}