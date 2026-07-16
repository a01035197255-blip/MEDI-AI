package com.project.dicom_ai.analysis.service;

import com.project.dicom_ai.analysis.entity.AiOverlay;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.dcm4che3.data.*;
import org.dcm4che3.io.DicomOutputStream;
import org.dcm4che3.util.UIDUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Transactional
public class SecondaryCaptureService {

    private static final String SC_DIRECTORY = "dicom/sc";

    @Transactional(readOnly = true)
    public String createSecondaryCapture(Attributes original, AiOverlay overlay, Long analysisId) {
        try {
            // 1. DICOM 메타데이터 준비
            Attributes attrs = prepareMetadata(original);

            // 2. 이미지 생성 및 AI Overlay 합성
            byte[] pixelData = generateOverlayImage(original, overlay);

            // 3. 픽셀 데이터 및 이미지 속성 설정
            setPixelDataAttributes(attrs, pixelData, original);

            // 4. 파일 저장
            return saveDicomFile(attrs, analysisId);

        } catch (IOException e) {
            throw new BusinessException(ErrorCode.SECONDARY_CAPTURE_CREATION_FAILED);
        }
    }

    private Attributes prepareMetadata(Attributes original) {
        Attributes attrs = new Attributes(original);
        attrs.setString(Tag.SOPClassUID, VR.UI, UID.SecondaryCaptureImageStorage);
        attrs.setString(Tag.SOPInstanceUID, VR.UI, UIDUtils.createUID());
        attrs.setString(Tag.SeriesInstanceUID, VR.UI, UIDUtils.createUID());
        attrs.setString(Tag.Modality, VR.CS, "SC");

        int seriesNum = original.getInt(Tag.SeriesNumber, 0) + 1;
        attrs.setInt(Tag.SeriesNumber, VR.IS, seriesNum);

        return attrs;
    }

    private byte[] generateOverlayImage(Attributes original, AiOverlay overlay) {
        int width = original.getInt(Tag.Columns, 512);
        int height = original.getInt(Tag.Rows, 512);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = image.createGraphics();

        g.setColor(Color.BLACK);
        g.fillRect(0, 0, width, height);

        g.setColor(Color.WHITE);
        g.drawRect(overlay.getBboxX().intValue(), overlay.getBboxY().intValue(),
                overlay.getBboxW().intValue(), overlay.getBboxH().intValue());
        g.dispose();

        return ((java.awt.image.DataBufferByte) image.getRaster().getDataBuffer()).getData();
    }

    private void setPixelDataAttributes(Attributes attrs, byte[] pixels, Attributes original) {
        attrs.setInt(Tag.Rows, VR.US, original.getInt(Tag.Rows, 512));
        attrs.setInt(Tag.Columns, VR.US, original.getInt(Tag.Columns, 512));
        attrs.setInt(Tag.SamplesPerPixel, VR.US, 1);
        attrs.setString(Tag.PhotometricInterpretation, VR.CS, "MONOCHROME2");
        attrs.setInt(Tag.BitsAllocated, VR.US, 8);
        attrs.setInt(Tag.BitsStored, VR.US, 8);
        attrs.setInt(Tag.HighBit, VR.US, 7);
        attrs.setInt(Tag.PixelRepresentation, VR.US, 0);
        attrs.setBytes(Tag.PixelData, VR.OW, pixels);
    }

    private String saveDicomFile(Attributes attrs, Long analysisId) throws IOException {
        File directory = new File(SC_DIRECTORY);
        if (!directory.exists()) directory.mkdirs();

        File file = new File(directory, "AI_SC_" + analysisId + ".dcm");

        try (DicomOutputStream dos = new DicomOutputStream(file)) {
            dos.writeDataset(attrs.createFileMetaInformation(UID.ExplicitVRLittleEndian), attrs);
        }
        return file.getAbsolutePath();
    }
}