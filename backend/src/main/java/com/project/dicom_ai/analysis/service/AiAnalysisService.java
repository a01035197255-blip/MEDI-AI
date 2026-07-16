package com.project.dicom_ai.analysis.service;

import com.project.dicom_ai.analysis.dto.AiAnalysisResponse;
import com.project.dicom_ai.analysis.dto.AiOverlayDto;
import com.project.dicom_ai.analysis.dto.CompareAnalysisResponse;
import com.project.dicom_ai.analysis.dto.SCResponse;
import com.project.dicom_ai.analysis.entity.*;
import com.project.dicom_ai.analysis.repository.AiAnalysisRepository;
import com.project.dicom_ai.analysis.repository.AiFindingRepository;
import com.project.dicom_ai.analysis.repository.AiOverlayRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.common.file.CustomMultipartFile;
import com.project.dicom_ai.dicom.service.DicomFileService;
import com.project.dicom_ai.image.entity.Image;
import com.project.dicom_ai.image.repository.ImageRepository;
import com.project.dicom_ai.onnx.InferenceService;
import com.project.dicom_ai.onnx.module.DetectedObject;
import com.project.dicom_ai.onnx.module.MedicalModelTarget;
import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.patient.repository.PatientRepository;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.series.repository.SeriesRepository;
import com.project.dicom_ai.study.entity.Status;
import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dcm4che3.data.Attributes;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AiAnalysisService {
    private final DicomFileService dicomService;
    private final StudyRepository studyRepository;
    private final AiAnalysisRepository analysisRepository;
    private final AiFindingRepository findingRepository;
    private final AiOverlayRepository overlayRepository;
    private final PatientRepository patientRepository;
    private final SecondaryCaptureService secondaryCaptureService;
    private final ImageRepository imageRepository;
    private final InferenceService inferenceService;
    private final SeriesRepository seriesRepository;

    // AI 분석 요청
    @Transactional
    public AiAnalysisResponse requestAnalysis(String studyInstanceUid, Long userId , String seriesInstanceUid) {

        // ============================
        // 1. Study 조회
        // ============================
        Study study = studyRepository.findByStudyInstanceUid(studyInstanceUid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        if (!study.getPatient().getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.STUDY_NOT_FOUND);
        }

        log.info("study user={}", study.getPatient().getUser().getId());
        log.info("login user={}", userId);

        Series series = seriesRepository.findBySeriesInstanceUidAndStudy_Id(seriesInstanceUid, study.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERIES_NOT_FOUND));

        log.info("studyUid = {}", studyInstanceUid);

        MedicalModelTarget target = MedicalModelTarget.findModel(series.getBodyPart().name());

        // ============================
        // 2. 기존 분석 확인
        // ============================
        Optional<AiAnalysis> existing = analysisRepository.findByStudy_StudyInstanceUid(studyInstanceUid);

        if (existing.isPresent()) {
            return AiAnalysisResponse.from(existing.get());
        }

        // ============================
        // 3. Analysis 생성 (RUNNING)
        // ============================
        AiAnalysis analysis = AiAnalysis.builder()
                .study(study)
                .patient(study.getPatient())
                .series(series)
                .modelName(target.name())   // CHEST_DISEASE
                .modelVersion("1.0")       // 실제 버전
                .status(AnalysisStatus.RUNNING)
                .diagnosisResult(DiagnosisResult.NORMAL)
                .build();

        analysis = analysisRepository.save(analysis);

        try {

            // ============================
            // 4. Study의 이미지 조회
            // ============================
            List<Image> images =  imageRepository.findBySeries_SeriesInstanceUid(seriesInstanceUid);

            if (images.isEmpty()) {
                throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
            }

            List<MultipartFile> files = new ArrayList<>();

            for (Image image : images) {

                Path path = Paths.get(image.getFilePath());

                byte[] bytes = Files.readAllBytes(path);

                files.add(
                        new CustomMultipartFile(
                                bytes,
                                path.getFileName().toString()
                        )
                );
            }

            // ============================
            // 5. AI 추론
            // ============================
            List<List<DetectedObject>> results =
                    inferenceService.processImagesAsync(
                            files.toArray(new MultipartFile[0]),
                            series.getBodyPart().name()
                    ).join();

            log.info("이미지 개수 = {}", images.size());
            log.info("추론 결과 개수 = {}", results.size());

            // ============================
            // 6. Finding 저장
            // ============================
            for (int i = 0; i < images.size(); i++) {

                Image image = images.get(i);

                List<DetectedObject> detectionList = results.get(i);

                for (DetectedObject obj : detectionList) {

                    DetectedObject.BoxDimensions box =
                            new DetectedObject.BoxDimensions(
                                    Math.round(obj.getXMin()),
                                    Math.round(obj.getYMin()),
                                    Math.round(obj.getXMax() - obj.getXMin()),
                                    Math.round(obj.getYMax() - obj.getYMin())
                            );

                    AiFinding finding = AiFinding.builder()
                            .analysis(analysis)
                            .sliceIndex(image.getInstanceNumber())
                            .label(obj.getLabel())
                            .labelKo(obj.getLabel())
                            .description(obj.getLabel() + " detected")
                            .confidence((double) obj.getConfidence())
                            .riskLevel(RiskLevel.MEDIUM) // 일단 고정
                            .build();

                    findingRepository.save(finding);

                    AiOverlay overlay = AiOverlay.builder()
                            .analysis(analysis)
                            .image(image)
                            .sliceIndex(image.getInstanceNumber())
                            .bboxX((double) box.x())
                            .bboxY((double) box.y())
                            .bboxW((double) box.width())
                            .bboxH((double) box.height())
                            .confidence((double) obj.getConfidence())
                            .build();

                    overlayRepository.save(overlay);
                }
            }

            // ============================
            // 8. Analysis 업데이트
            // ============================
            boolean abnormal = results.stream()
                    .flatMap(List::stream)
                    .findAny()
                    .isPresent();

            analysis.setDiagnosisResult(
                    abnormal
                            ? DiagnosisResult.SUSPICIOUS
                            : DiagnosisResult.NORMAL
            );

            analysis.setOverallImpression(
                    abnormal
                            ? "Suspicious lesion detected."
                            : "No abnormal findings."
            );

            analysis.setProcessingTimeMs(3200L);
            analysis.setStatus(AnalysisStatus.SUCCESS);

            analysisRepository.save(analysis);

            // ============================
            // 9. Study 완료
            // ============================
            study.setStatus(Status.DONE);

            return AiAnalysisResponse.from(analysis);

        } catch (Exception e) {

            analysis.setStatus(AnalysisStatus.FAILED);
            analysisRepository.save(analysis);

            study.setStatus(Status.FAILED);

            throw new BusinessException(ErrorCode.AI_ANALYSIS_FAILED);
        }
    }

    public List<AiOverlayDto> getOverlays(
            String studyInstanceUid,
            Long userId
    ){

        Study study = studyRepository.findByStudyInstanceUid(studyInstanceUid)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        // 본인 Study인지 확인
        if(!study.getPatient()
                .getUser()
                .getId()
                .equals(userId)){

            throw new BusinessException(ErrorCode.STUDY_NOT_FOUND);
        }

        List<AiOverlay> overlays = overlayRepository.findByAnalysis_Study_StudyInstanceUid(studyInstanceUid);

        return overlays.stream()
                .map(AiOverlayDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnalysisStatus getAnalysisStatus(Long analysisId, Long userId) {

        return findAnalysis(analysisId, userId).getStatus();
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponse getAnalysisResult(Long analysisId, Long userId) {

        return AiAnalysisResponse.from(findAnalysis(analysisId, userId));
    }
    @Transactional(readOnly = true)
    public List<AiAnalysisResponse> getAllAnalysis(Long userId) {

        return analysisRepository
                .findAllByPatientUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(AiAnalysisResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompareAnalysisResponse compareAnalysisResult(Long currentId, Long previousId, Long userId) {

        AiAnalysis current = findAnalysis(currentId, userId);
        AiAnalysis previous = findAnalysis(previousId, userId);

        return CompareAnalysisResponse.builder()
                .current(current.getOverallImpression())
                .previous(previous.getOverallImpression())
                .change("No significant change")
                .build();
    }

    @Transactional(readOnly = true)
    public List<AiAnalysisResponse> getAnalysisHistory(Long patientId, Long userId) {

        Patient patient = patientRepository
                .findByIdAndUser_Id(patientId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PATIENT_NOT_FOUND));

        return analysisRepository
                .findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(AiAnalysisResponse::from)
                .toList();
    }

    // --- 보조 메서드 (Private helpers) ---
    private AiAnalysis findAnalysis(Long analysisId, Long userId) {

        AiAnalysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AI_ANALYSIS_NOT_FOUND));

        if (!analysis.getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.AI_ANALYSIS_NOT_FOUND);
        }

        return analysis;
    }

    // ===============================
    // Secondary Capture 생성
    // ===============================
    @Transactional(readOnly = true)
    public SCResponse generateSecondaryCapture(
            Long analysisId,
            Long userId
    ) {

        AiAnalysis analysis = findAnalysis(analysisId, userId);

        AiOverlay overlay = analysis.getOverlays()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.AI_OVERLAY_NOT_FOUND)
                );

        Attributes original =
                dicomService.readAttributes(
                        overlay.getImage().getFilePath()
                );

        String path =
                secondaryCaptureService.createSecondaryCapture(
                        original,
                        overlay,
                        analysisId
                );

        return buildResponse(
                overlay,
                analysisId,
                path
        );
    }

    private SCResponse buildResponse(
            AiOverlay overlay,
            Long analysisId,
            String path
    ) {
        return SCResponse.builder()
                .scId(overlay.getId())
                .analysisId(analysisId)
                .imagePath(path)
                .sliceIndex(overlay.getSliceIndex())
                .build();
    }

    // ===============================
    // Secondary Capture 목록
    // ===============================
    @Transactional(readOnly = true)
    public List<SCResponse> listSecondaryCaptures(
            Long analysisId,
            Long userId
    ) {
        AiAnalysis analysis = findAnalysis(analysisId, userId);

        return analysis.getOverlays()
                .stream()
                .map(SCResponse::from)
                .toList();
    }

    // ===============================
    // Secondary Capture 단건 조회
    // ===============================
    @Transactional(readOnly = true)
    public SCResponse getSecondaryCapture(
            Long scId,
            Long userId
    ) {
        AiOverlay overlay = overlayRepository.findById(scId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.AI_OVERLAY_NOT_FOUND)
                );

        if (!overlay.getAnalysis()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.AI_OVERLAY_NOT_FOUND);
        }

        return SCResponse.from(overlay);
    }

}