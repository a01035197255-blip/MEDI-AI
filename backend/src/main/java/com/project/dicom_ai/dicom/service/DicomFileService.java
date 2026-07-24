package com.project.dicom_ai.dicom.service;

import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import com.project.dicom_ai.dicom.dto.DicomFileResponse;
import com.project.dicom_ai.dicom.dto.DicomUploadResult;
import com.project.dicom_ai.dicom.entity.DicomFile;
import com.project.dicom_ai.dicom.repository.DicomFileRepository;
import com.project.dicom_ai.image.entity.Image;
import com.project.dicom_ai.image.repository.ImageRepository;
import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.patient.repository.PatientRepository;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.series.repository.SeriesRepository;
import com.project.dicom_ai.study.entity.Status;
import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.io.DicomInputStream;
import org.dcm4che3.data.Tag;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DicomFileService {

    @Value("${file.upload-dir}")
    private String baseDir;

    private final PatientRepository patientRepository;
    private final StudyRepository studyRepository;
    private final SeriesRepository seriesRepository;
    private final ImageRepository imageRepository;
    private final DicomFileRepository dicomFileRepository;
    private final UserRepository userRepository;
    private final DicomImageConverter dicomImageConverter;

    public DicomUploadResult upload(
            MultipartFile file,
            Long patientId,
            Long studyId,
            Long userId
    ) throws Exception {

        File tempFile = Files.createTempFile(
                "dicom-upload-",
                ".dcm").toFile();

        try {
            file.transferTo(tempFile);

            return uploadFile(
                    tempFile,
                    file.getOriginalFilename(),
                    patientId,
                    studyId,
                    userId
            );
        } finally {
            Files.deleteIfExists(tempFile.toPath());
        }
    }

    @Transactional
    public DicomUploadResult uploadFile(File file, String originalFilename, Long patientId, Long studyId, Long userId )throws Exception {
        System.out.println("uploadFile 시작");

        // =========================
        // 1. 파일 저장
        // =========================
        File dir = new File(baseDir);
        if (!dir.exists()) dir.mkdirs();

        String filePath = baseDir + "/" + UUID.randomUUID() + ".dcm";
        Files.copy(
                file.toPath(),
                new File(filePath).toPath(),
                StandardCopyOption.REPLACE_EXISTING
        );

        // =========================
        // 2. DICOM 파싱
        // =========================
        Attributes attr;
        try (DicomInputStream dis = new DicomInputStream(new File(filePath))) {
            attr = dis.readDataset(-1, -1);
        }

        String seriesUid = attr.getString(Tag.SeriesInstanceUID);
        String sopUid = attr.getString(Tag.SOPInstanceUID);

        System.out.println("SOP = " + sopUid);

        // =========================
        // 3. SOP 중복 체크 (필수)
        // =========================
        if (imageRepository.findBySopInstanceUid(sopUid).isPresent()) {
            return null;
        }

        Patient patient = patientRepository.findByIdAndUser_Id(patientId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PATIENT_NOT_FOUND));
        System.out.println("patient OK");

        Study study = studyRepository.findByIdAndPatient_Id(
                studyId,
                patient.getId()
        ).orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));
        System.out.println("study OK");

        // =========================
        // 6. Series UPSERT
        // =========================
        Series series = seriesRepository.findBySeriesInstanceUidAndStudy_Id(
                        seriesUid,
                        study.getId())
                .orElseGet(() -> seriesRepository.save(
                        Series.builder().seriesInstanceUid(seriesUid)
                                        .seriesNumber(DicomParser.parseInt(attr.getString(Tag.SeriesNumber)))
                                        .bodyPart(DicomParser.parseBodyPart(attr.getString(Tag.BodyPartExamined)))
                                        .study(study)
                                        .build())
                );
        System.out.println("series OK");

        System.out.println("PNG 시작");
        String pngPath = dicomImageConverter.convertToPng(filePath);
        System.out.println("PNG 완료 : " + pngPath);
        // =========================
        // 7. IMAGE 저장
        // =========================
        Image image = new Image();

        image.setSopInstanceUid(sopUid);
        image.setSopClassUid(attr.getString(Tag.SOPClassUID));
        image.setSeries(series);

        image.setImageType(
                DicomParser.parseImageType(attr.getStrings(Tag.ImageType))
        );

        image.setFilePath(filePath);
        image.setPngPath(pngPath);
        image.setOriginalFilename(originalFilename);

        image.setInstanceNumber(attr.getInt(Tag.InstanceNumber, 0));

        image.setRows(attr.getInt(Tag.Rows, 0));
        image.setColumns(attr.getInt(Tag.Columns, 0));

        image.setWindowCenter(
                DicomParser.parseDouble(attr.getString(Tag.WindowCenter))
        );

        image.setWindowWidth(
                DicomParser.parseDouble(attr.getString(Tag.WindowWidth))
        );

        image.setPixelSpacingX(
                DicomParser.parsePixelSpacingX(attr.getStrings(Tag.PixelSpacing))
        );

        image.setPixelSpacingY(
                DicomParser.parsePixelSpacingY(attr.getStrings(Tag.PixelSpacing))
        );

        image.setRescaleSlope(
                DicomParser.parseDouble(attr.getString(Tag.RescaleSlope))
        );

        image.setRescaleIntercept(
                DicomParser.parseDouble(attr.getString(Tag.RescaleIntercept))
        );

        imageRepository.save(image);
        System.out.println("IMAGE 저장 완료");

        // =========================
        // 8. RESULT
        // =========================
        return DicomUploadResult.builder()
                .filePath(filePath)
                .pngPath(image.getPngPath())
                .originalFilename(image.getOriginalFilename())

                .patientIdentifier(patient.getPatientIdentifier())
                .patientName(patient.getName())
                .patientBirthDate(patient.getBirthDate())
                .patientSex(patient.getGender())

                .studyInstanceUid(study.getStudyInstanceUid())
                .studyDate(study.getStudyDate())
                .modality(study.getModality())
                .studyDescription(study.getDescription())

                .seriesInstanceUid(series.getSeriesInstanceUid())
                .seriesNumber(series.getSeriesNumber())
                .bodyPart(series.getBodyPart())

                .sopInstanceUid(image.getSopInstanceUid())
                .sopClassUid(image.getSopClassUid())
                .instanceNumber(image.getInstanceNumber())
                .rows(image.getRows())
                .columns(image.getColumns())
                .windowCenter(image.getWindowCenter())
                .windowWidth(image.getWindowWidth())
                .pixelSpacingX(image.getPixelSpacingX())
                .pixelSpacingY(image.getPixelSpacingY())

                .build();
    }

    public List<DicomUploadResult> importZip(MultipartFile zipFile, Long patientId, Long studyId, Long userId
    ) throws Exception {
        List<DicomUploadResult> results = new ArrayList<>();

        File tempDir = Files.createTempDirectory("dicom-upload-").toFile();

        try (
                ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {

            ZipEntry entry;

            while((entry = zis.getNextEntry()) != null) {

                if(entry.isDirectory())
                    continue;

                if(!entry.getName().toLowerCase().endsWith(".dcm"))
                    continue;

                String originalName = Paths
                        .get(entry.getName())
                        .getFileName()
                        .toString();

                File dcmFile = new File(
                        tempDir,
                        originalName
                );

                Files.copy(
                        zis,
                        dcmFile.toPath(),
                        StandardCopyOption.REPLACE_EXISTING
                );

                DicomUploadResult result = uploadFile(
                        dcmFile,
                        originalName,
                        patientId,
                        studyId,
                        userId
                );

                if(result != null){
                    results.add(result);
                }
            }
        } finally {
            deleteDirectory(tempDir);
        }
        return results;
        }

    private void deleteDirectory(File file) throws IOException {

        if (file.isDirectory()) {

            File[] files = file.listFiles();

            if (files != null) {

                for (File child : files) {
                    deleteDirectory(child);
                }
            }
        }

        Files.deleteIfExists(file.toPath());
    }

    public List<DicomUploadResult> importDicom(List<MultipartFile> files, Long patientId, Long studyId, Long userId) {

        return files.parallelStream()
                .map(file -> {
                    try {
                        return upload(file, patientId, studyId, userId);
                    } catch (Exception e) {
                        log.error("DICOM upload failed", e);
                        throw new BusinessException(ErrorCode.DICOM_UPLOAD_FAILED);
                    }
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public DicomFileResponse findDicomById(Long id, Long userId) {

        DicomFile dicom = dicomFileRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DICOM_NOT_FOUND));

        if (!dicom.getStudy().getPatient().getUser().getId().equals(userId)) {

            throw new BusinessException(ErrorCode.DICOM_NOT_FOUND);
        }

        return DicomFileResponse.from(dicom);
    }

    @Transactional(readOnly = true)
    public DicomFileResponse findBySopInstanceUid(String sopInstanceUid, Long userId) {

        DicomFile dicom = dicomFileRepository.findBySopInstanceUid(sopInstanceUid)
                .orElseThrow(() -> new BusinessException(ErrorCode.DICOM_NOT_FOUND));

        if (!dicom.getStudy()
                .getPatient()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BusinessException(ErrorCode.DICOM_NOT_FOUND);
        }

        return DicomFileResponse.from(dicom);
    }

    @Transactional(readOnly = true)
    public List<DicomFileResponse> getByStudy(String studyInstanceUid, Long userId) {

        Study study = studyRepository.findByStudyInstanceUidAndPatientUser_Id(studyInstanceUid, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        return dicomFileRepository.findByStudy_StudyInstanceUid(study.getStudyInstanceUid())
                .stream()
                .map(DicomFileResponse::from)
                .toList();
    }

    public Attributes readAttributes(String filePath) {
        File file = new File(filePath);

        if (!file.exists()) {
            throw new BusinessException(ErrorCode.DICOM_NOT_FOUND);
        }

        try (DicomInputStream dis = new DicomInputStream(file)) {
            // -1, -1은 파일 전체의 속성을 읽어오겠다는 의미입니다.
            return dis.readDataset(-1, -1);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.DICOM_METADATA_READ_FAILED);
        }
    }
}