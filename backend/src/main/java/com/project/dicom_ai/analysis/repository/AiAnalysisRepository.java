package com.project.dicom_ai.analysis.repository;

import com.project.dicom_ai.analysis.entity.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {

    List<AiAnalysis> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<AiAnalysis> findAllByPatientUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<AiAnalysis> findByStudy_StudyInstanceUid(String studyInstanceUid);


}