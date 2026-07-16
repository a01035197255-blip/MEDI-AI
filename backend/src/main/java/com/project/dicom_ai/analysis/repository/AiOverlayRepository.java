package com.project.dicom_ai.analysis.repository;

import com.project.dicom_ai.analysis.entity.AiOverlay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiOverlayRepository extends JpaRepository<AiOverlay, Long> {

    List<AiOverlay> findByImage_Id(Long imageId);
    List<AiOverlay> findByAnalysis_Study_StudyInstanceUid(String studyUid);
}