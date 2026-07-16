package com.project.dicom_ai.dicom.repository;

import com.project.dicom_ai.dicom.entity.DicomFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DicomFileRepository extends JpaRepository<DicomFile, Long> {

    Optional<DicomFile> findBySopInstanceUid(String sopInstanceUid);

    List<DicomFile> findBySeries_SeriesInstanceUid(String seriesInstanceUid);

    List<DicomFile> findByStudy_StudyInstanceUid(String studyInstanceUid);
}