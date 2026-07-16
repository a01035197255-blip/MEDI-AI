package com.project.dicom_ai.study.repository;

import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.study.entity.Status;
import com.project.dicom_ai.study.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyRepository extends JpaRepository<Study, Long> {

    List<Study> findByPatientUserId(Long userId);

    List<Study> findByPatientId(Long patientId);

    // =========================
    // 1. uid 기준 study 조회
    // =========================
    Optional<Study> findByStudyInstanceUidAndPatientUser_Id(String studyInstanceUid, Long userId);

    Optional<Study> findByStudyInstanceUidAndPatientUserId(String studyInstanceUid, Long userId);

    Optional<Study> findByIdAndPatient_Id(Long id, Long patientId);

    Optional<Study> findByStudyInstanceUid(String studyInstanceUid);

    @Query("""
    select s
    from Study s
    join s.patient p
    where s.id = :studyId
      and p.user.id = :userId
""")
    Optional<Study> findByIdAndUserId(
            @Param("studyId") Long studyId,
            @Param("userId") Long userId
    );

}