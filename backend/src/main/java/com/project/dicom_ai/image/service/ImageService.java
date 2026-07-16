package com.project.dicom_ai.image.service;

import com.project.dicom_ai.image.dto.ImageRequest;
import com.project.dicom_ai.image.dto.ImageResponse;
import com.project.dicom_ai.image.entity.Image;
import com.project.dicom_ai.image.repository.ImageRepository;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.series.repository.SeriesRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;
    private final SeriesRepository seriesRepository;

    // =========================
    // Image 생성 (DICOM 업로드 시 사용)
    // =========================
    public ImageResponse create(ImageRequest request, Long userId) {

        Series series = seriesRepository.findById(request.getSeriesId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERIES_NOT_FOUND));

        if (!series.getStudy().getPatient().getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SERIES_NOT_FOUND);
        }

        Image image = imageRepository.findBySopInstanceUid(request.getSopInstanceUid()).orElseGet(() ->
                        imageRepository.save(Image.builder()
                                        .sopInstanceUid(request.getSopInstanceUid())
                                        .series(series)
                                        .imageType(request.getImageType())
                                        .filePath(request.getFilePath())
                                        .originalFilename(request.getOriginalFilename())
                                        .instanceNumber(request.getInstanceNumber())
                                        .windowCenter(request.getWindowCenter())
                                        .windowWidth(request.getWindowWidth())
                                        .rows(request.getRows())
                                        .columns(request.getColumns())
                                        .pixelSpacingX(request.getPixelSpacingX())
                                        .pixelSpacingY(request.getPixelSpacingY())
                                        .rescaleSlope(request.getRescaleSlope())
                                        .rescaleIntercept(request.getRescaleIntercept())
                                        .uploadedAt(java.time.LocalDateTime.now())
                                        .build()
                        )
                );

        return ImageResponse.from(image);
    }

    // =========================
    // SOP Instance UID 기준 조회 (PACS 표준)
    // =========================
    @Transactional(readOnly = true)
    public ImageResponse getBySopInstanceUid(String sopInstanceUid, Long userId) {

        Image image = imageRepository.findBySopInstanceUid(sopInstanceUid)
                .orElseThrow(() -> new BusinessException(ErrorCode.IMAGE_NOT_FOUND));

        if (!image.getSeries()
                .getStudy()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
        }

        return ImageResponse.from(image);
    }


    // =========================
    // Series 기준 Image 조회 (Viewer 핵심)
    // =========================
    @Transactional(readOnly = true)
    public List<ImageResponse> getSeriesImages(Long seriesId, Long userId) {

        Series series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERIES_NOT_FOUND));

        if (!series.getStudy()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.SERIES_NOT_FOUND);
        }

        return imageRepository
                .findBySeriesIdOrderByInstanceNumberAsc(seriesId)
                .stream()
                .map(ImageResponse::from)
                .toList();
    }


    // =========================
    // 단건 조회
    // =========================
    @Transactional(readOnly = true)
    public ImageResponse get(Long id, Long userId) {

        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.IMAGE_NOT_FOUND));

        if (!image.getSeries()
                .getStudy()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
        }

        return ImageResponse.from(image);
    }

    @Transactional(readOnly = true)
    public Resource getDicomFile(
            String sopInstanceUid,
            Long userId
    ) {

        Image image =
                imageRepository.findBySopInstanceUid(sopInstanceUid)
                        .orElseThrow(() ->
                                new BusinessException(ErrorCode.IMAGE_NOT_FOUND)
                        );


        if (!image.getSeries()
                .getStudy()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
        }


        Path path = Paths.get(image.getFilePath());


        if (!path.toFile().exists()) {
            throw new BusinessException(ErrorCode.DICOM_NOT_FOUND);
        }


        return new FileSystemResource(path);
    }
}