package com.project.dicom_ai.patient.service;

import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.patient.dto.PatientRequest;
import com.project.dicom_ai.patient.dto.PatientResponse;
import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientResponse submit(PatientRequest request, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Patient patient = Patient.builder()
                .name(request.getName())
                .birthDate(request.getBirthDate())
                .phone(request.getPhone())
                .gender(request.getGender())
                .user(user)
                .patientIdentifier("PT-" + UUID.randomUUID().toString().substring(0, 8))
                .createdAt(LocalDateTime.now())
                .build();

        patient = patientRepository.save(patient);

        return PatientResponse.from(patient);
    }

    // =========================
    // 2. pid 기준 환자 조회
    // =========================
    @Transactional(readOnly = true)
    public PatientResponse getByPatientId(String patientIdentifier, Long userId) {

        Patient patient = patientRepository
                .findByPatientIdentifierAndUser_Id(patientIdentifier, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PATIENT_NOT_FOUND));

        return PatientResponse.from(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(Long id, Long userId) {

        Patient patient = patientRepository
                .findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PATIENT_NOT_FOUND));

        return PatientResponse.from(patient);
    }

    // =========================
    // 2. 전체 환자 조회
    // =========================
    @Transactional(readOnly = true)
    public List<PatientResponse> findAllPatients(Long userId) {

        return patientRepository.findByUser_Id(userId)
                .stream()
                .map(PatientResponse::from)
                .toList();
    }

    // =========================
    // 4. 검색 (이름 / patientIdentifier)
    // =========================
    @Transactional(readOnly = true)
    public List<PatientResponse> searchPatients(String keyword, Long userId) {

        return patientRepository.searchPatients(userId, keyword)
                .stream()
                .map(PatientResponse::from)
                .toList();
    }
}