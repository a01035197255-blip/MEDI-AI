package com.project.dicom_ai.dicom.dto;

import com.project.dicom_ai.dicom.entity.DicomFile;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DicomFileResponse {

    private Long id;

    private String studyInstanceUid;
    private String seriesInstanceUid;

    private Integer instanceNumber;
    private String sopClassUid;
    private String sopInstanceUid;

    private String filePath;
    private String originalFilename;

    public static DicomFileResponse from(DicomFile dicom) {
        return DicomFileResponse.builder()
                .id(dicom.getId())
                .studyInstanceUid(dicom.getStudy().getStudyInstanceUid())
                .seriesInstanceUid(dicom.getSeries().getSeriesInstanceUid())
                .instanceNumber(dicom.getInstanceNumber())
                .sopClassUid(dicom.getSopClassUid())
                .sopInstanceUid(dicom.getSopInstanceUid())
                .filePath(dicom.getFilePath())
                .originalFilename(dicom.getOriginalFilename())
                .build();
    }
}