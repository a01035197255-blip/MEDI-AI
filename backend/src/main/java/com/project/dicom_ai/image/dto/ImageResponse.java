package com.project.dicom_ai.image.dto;

import com.project.dicom_ai.image.entity.Image;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageResponse {

    // =========================
    // BASIC INFO
    // =========================
    private Long id;
    private String sopInstanceUid;
    private Long seriesId;
    private String imageType;

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

    // =========================
    // SYSTEM
    // =========================
    private String uploadedAt;

    public static ImageResponse from(Image image) {
        return ImageResponse.builder()
                .id(image.getId())
                .sopInstanceUid(image.getSopInstanceUid())
                .seriesId(image.getSeries().getId())
                .imageType(image.getImageType().name())

                .filePath(image.getFilePath())
                .originalFilename(image.getOriginalFilename())

                .instanceNumber(image.getInstanceNumber())

                .windowCenter(image.getWindowCenter())
                .windowWidth(image.getWindowWidth())

                // CT / AI
                .rows(image.getRows())
                .columns(image.getColumns())

                .pixelSpacingX(image.getPixelSpacingX())
                .pixelSpacingY(image.getPixelSpacingY())

                .rescaleSlope(image.getRescaleSlope())
                .rescaleIntercept(image.getRescaleIntercept())

                // system
                .uploadedAt(
                        image.getUploadedAt() != null
                                ? image.getUploadedAt().toString()
                                : null
                )

                .build();
    }
}