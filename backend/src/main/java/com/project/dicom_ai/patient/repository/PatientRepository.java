package com.project.dicom_ai.patient.repository;

import com.project.dicom_ai.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByUser_Id(Long userId);

    Optional<Patient> findByIdAndUser_Id(Long id, Long userId);

    Optional<Patient> findByPatientIdentifierAndUser_Id(String patientIdentifier, Long userId);

    @Query("""
    select p
    from Patient p
    where p.user.id = :userId
      and (
           lower(p.name) like lower(concat('%', :keyword, '%'))
        or lower(p.patientIdentifier) like lower(concat('%', :keyword, '%'))
      )
""")
    List<Patient> searchPatients(Long userId, String keyword);



}