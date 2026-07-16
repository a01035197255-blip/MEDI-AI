package com.project.dicom_ai.study.service;

import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.patient.repository.PatientRepository;
import com.project.dicom_ai.study.dto.StudyRequest;
import com.project.dicom_ai.study.dto.StudyResponse;
import com.project.dicom_ai.study.entity.Status;
import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.dcm4che3.util.UIDUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyService {

    private final StudyRepository studyRepository;
    private final PatientRepository patientRepository;

    // =========================
    // 1. 환자정보 등록
    // =========================
    public StudyResponse submit(StudyRequest request, Long userId) {

        Patient patient = patientRepository
                .findByIdAndUser_Id(request.getPatientId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PATIENT_NOT_FOUND));

        Study study = Study.builder()
                .patient(patient)
                .studyInstanceUid(UIDUtils.createUID())
                .modality(request.getModality())
                .studyDate(request.getStudyDate())
                .description(request.getDescription())
                .status(Status.UPLOADED)
                .build();

        Study saved = studyRepository.save(study);

        return StudyResponse.from(saved);
    }
    // =========================
    // 3. 환자별 검사 목록 조회
    // =========================
    @Transactional(readOnly = true)
    public List<StudyResponse> findByPatientId(Long patientId, Long userId) {

        Patient patient = patientRepository.findByIdAndUser_Id(patientId, userId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.PATIENT_NOT_FOUND)
                );


        return studyRepository.findByPatientId(patient.getId())
                .stream()
                .map(StudyResponse::from)
                .toList();
    }
    // =========================
    // 2. uid 기준 study 조회
    // =========================
    @SneakyThrows
    @Transactional(readOnly = true)
    public StudyResponse getByStudyInstanceUid(
            String studyInstanceUid,
            Long userId
    ) {
        Study study = studyRepository
                .findByStudyInstanceUidAndPatientUserId(
                        studyInstanceUid,
                        userId
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return StudyResponse.from(study);
    }

    @Transactional(readOnly = true)
    public List<StudyResponse> findAllStudies(Long userId) {

        return studyRepository
                .findByPatientUserId(userId)
                .stream()
                .map(StudyResponse::from)
                .toList();
    }
}