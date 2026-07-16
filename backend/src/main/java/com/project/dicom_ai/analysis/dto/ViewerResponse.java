package com.project.dicom_ai.analysis.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ViewerResponse {

    private String studyInstanceUid;

    private String seriesInstanceUid;

    private List<ImageViewerDto> images;

}