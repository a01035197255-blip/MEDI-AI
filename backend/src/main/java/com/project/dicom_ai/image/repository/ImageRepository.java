package com.project.dicom_ai.image.repository;

import com.project.dicom_ai.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {

    // SOP Instance UID로 단건 조회 (DICOM 고유값)
    Optional<Image> findBySopInstanceUid(String sopInstanceUid);

    // Series + 정렬 (슬라이스 순서용)
    List<Image> findBySeriesIdOrderByInstanceNumberAsc(Long seriesId);

    List<Image> findBySeries_SeriesInstanceUid(String seriesInstanceUid);
}