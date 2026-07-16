package com.project.dicom_ai.analysis.service;

import com.project.dicom_ai.analysis.dto.AiOverlayDto;
import com.project.dicom_ai.analysis.repository.AiOverlayRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.image.entity.Image;
import com.project.dicom_ai.image.repository.ImageRepository;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.series.repository.SeriesRepository;
import com.project.dicom_ai.analysis.dto.ImageViewerDto;
import com.project.dicom_ai.analysis.dto.ViewerResponse;
import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ViewerService {

    private final SeriesRepository seriesRepository;
    private final ImageRepository imageRepository;
    private final AiOverlayRepository overlayRepository;
    private final StudyRepository studyRepository;

    public ViewerResponse getViewer(
            String studyInstanceUid,
            String seriesInstanceUid,
            Long userId
    ) {

        Study study = studyRepository.findByStudyInstanceUid(studyInstanceUid)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.STUDY_NOT_FOUND)
                );

        if (!study.getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.STUDY_NOT_FOUND);
        }

        // 1. Series 조회
        Series series = seriesRepository.findBySeriesInstanceUidAndStudy_Id(seriesInstanceUid,
                        study.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERIES_NOT_FOUND));

        // 2. Image 조회
        List<Image> images = imageRepository.findBySeries_SeriesInstanceUid(seriesInstanceUid);

        List<ImageViewerDto> imageList = images.stream()
                        .map(image -> {

                            // 3. 해당 이미지 Overlay 조회
                            List<AiOverlayDto> overlays =
                                    overlayRepository
                                            .findByImage_Id(image.getId())
                                            .stream()
                                            .map(AiOverlayDto::from)
                                            .toList();

                            return ImageViewerDto.builder()
                                    .imageId(image.getId())
                                    .instanceNumber(image.getInstanceNumber())
                                    .sopInstanceUid(image.getSopInstanceUid())
                                    .imageUrl("/api/images/file/" + image.getSopInstanceUid())
                                    .rows(image.getRows())
                                    .columns(image.getColumns())
                                    .overlays(overlays)
                                    .build();

                        })
                        .toList();

        return ViewerResponse.builder().studyInstanceUid(series.getStudy().getStudyInstanceUid())
                .seriesInstanceUid(seriesInstanceUid)
                .images(imageList)
                .build();
    }
}