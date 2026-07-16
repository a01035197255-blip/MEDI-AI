package com.project.dicom_ai.series.repository;

import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.study.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeriesRepository extends JpaRepository<Series, Long> {

    Optional<Series> findBySeriesInstanceUidAndStudy_Id(
            String seriesInstanceUid,
            Long studyId
    );

    List<Series> findByStudyId(Long studyId);



}