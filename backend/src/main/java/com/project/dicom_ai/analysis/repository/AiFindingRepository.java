package com.project.dicom_ai.analysis.repository;

import com.project.dicom_ai.analysis.entity.AiFinding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiFindingRepository extends JpaRepository<AiFinding, Long> {

    List<AiFinding> findByAnalysisId(Long analysisId);
}