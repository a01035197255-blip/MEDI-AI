package com.project.dicom_ai.analysis.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ImageViewerDto {


    private Long imageId;

    private Integer instanceNumber;

    private String sopInstanceUid;

    private String imageUrl;

    private Integer rows;

    private Integer columns;


    private List<AiOverlayDto> overlays;

}