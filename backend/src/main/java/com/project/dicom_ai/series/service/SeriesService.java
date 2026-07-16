package com.project.dicom_ai.series.service;

import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.series.dto.SeriesRequest;
import com.project.dicom_ai.series.dto.SeriesResponse;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.series.repository.SeriesRepository;
import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final StudyRepository studyRepository;

    // =========================
    // 1. 생성
    // =========================
    public SeriesResponse create(String studyInstanceUid, SeriesRequest request, Long userId) {

        Study study = studyRepository.findByStudyInstanceUidAndPatientUser_Id(studyInstanceUid, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        Series series = seriesRepository.findBySeriesInstanceUidAndStudy_Id(request.getSeriesInstanceUid(),
                        study.getId())
                .orElseGet(() -> seriesRepository.save(
                        Series.builder()
                                .seriesInstanceUid(request.getSeriesInstanceUid())
                                .study(study)
                                .bodyPart(request.getBodyPart())
                                .build()
                ));

        return SeriesResponse.from(series);
    }

    // =========================
    // 2. Study UID 기준 조회
    // =========================
    public List<SeriesResponse> getByStudyInstanceUid(String studyInstanceUid, Long userId) {

        Study study = studyRepository.findByStudyInstanceUidAndPatientUser_Id(studyInstanceUid, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return seriesRepository.findByStudyId(study.getId()).stream()
                .map(SeriesResponse::from)
                .toList();
    }

    // =========================
    // 3. Study PK 기준 조회
    // =========================
    public List<SeriesResponse> getByStudyId(Long studyId, Long userId) {

        Study study = studyRepository.findByIdAndUserId(studyId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return seriesRepository.findByStudyId(study.getId()).stream()
                .map(SeriesResponse::from)
                .toList();
    }

    // =========================
    // 4. 단건 조회
    // =========================
    public SeriesResponse get(Long id, Long userId) {

        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERIES_NOT_FOUND));

        if (!series.getStudy().getPatient().getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SERIES_NOT_FOUND);
        }

        return SeriesResponse.from(series);
    }
}