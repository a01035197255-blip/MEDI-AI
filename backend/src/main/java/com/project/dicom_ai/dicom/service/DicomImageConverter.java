package com.project.dicom_ai.dicom.service;

import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Tag;
import org.dcm4che3.imageio.plugins.dcm.DicomImageReader;
import org.dcm4che3.imageio.plugins.dcm.DicomImageReadParam;
import org.dcm4che3.io.DicomInputStream;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;

@Service
public class DicomImageConverter {

    private static final String PNG_DIR = "C:/Users/TJ/Desktop/dicom/png";

    public String convertToPng(String dicomPath) {

        try {
            dicomPath = decompressDicom(dicomPath);

            File dicomFile = new File(dicomPath);

            if (!dicomFile.exists()) {
                throw new BusinessException(ErrorCode.DICOM_NOT_FOUND);
            }

            File dir = new File(PNG_DIR);
            if (!dir.exists()) dir.mkdirs();

            String fileName = dicomFile.getName()
                    .replace("_raw.dcm", ".png")
                    .replace(".dcm", ".png");
            String pngPath = PNG_DIR + "/" + fileName;

            // =========================
            // 1. DICOM Metadata 읽기
            // =========================
            Attributes attr;
            try (DicomInputStream dis = new DicomInputStream(dicomFile)) {
                attr = dis.readDataset(-1, -1);
            }

            // =========================
            // 2. Image Reader
            // =========================
            Iterator<ImageReader> it = ImageIO.getImageReadersByFormatName("DICOM");

            if (!it.hasNext()) {
                throw new BusinessException(ErrorCode.DICOM_READER_NOT_FOUND);
            }

            DicomImageReader reader = (DicomImageReader) it.next();

            try (ImageInputStream iis = ImageIO.createImageInputStream(dicomFile)) {

                reader.setInput(iis);

                DicomImageReadParam param =
                        (DicomImageReadParam) reader.getDefaultReadParam();

                // =========================
                // 3. WINDOW / LEVEL (안정 fallback)
                // =========================
                float wc = 40f;   // CT 기본 soft tissue
                float ww = 400f;

                String[] wcArr = attr.getStrings(Tag.WindowCenter);
                String[] wwArr = attr.getStrings(Tag.WindowWidth);

                if (wcArr != null && wcArr.length > 0 &&
                        wwArr != null && wwArr.length > 0) {

                    try {
                        wc = DicomParser.parseFirstFloat(wcArr);
                        ww = DicomParser.parseFirstFloat(wwArr);
                    } catch (Exception ignored) {}
                }

                param.setWindowCenter(wc);
                param.setWindowWidth(ww);

                // =========================
                // 4. 이미지 생성
                // =========================
                BufferedImage image = reader.read(0, param);

                if (image == null) {
                    throw new BusinessException(ErrorCode.DICOM_CONVERT_FAILED);
                }

                // =========================
                // 5. MONOCHROME1 처리
                // =========================
                String photometric = attr.getString(Tag.PhotometricInterpretation);

                if ("MONOCHROME1".equalsIgnoreCase(photometric)) {
                    image = invert(image);
                }

                // =========================
                // 6. PNG 저장
                // =========================
                ImageIO.write(image, "png", new File(pngPath));
            }

            return pngPath;

        } catch (IOException e) {
            throw new BusinessException(ErrorCode.DICOM_CONVERT_FAILED);
        }
    }

    // =========================
    // MONOCHROME1 invert
    // =========================
    private BufferedImage invert(BufferedImage image) {

        int w = image.getWidth();
        int h = image.getHeight();

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {

                int rgb = image.getRGB(x, y);

                int r = 255 - ((rgb >> 16) & 0xFF);
                int g = 255 - ((rgb >> 8) & 0xFF);
                int b = 255 - (rgb & 0xFF);

                int newRgb = (0xFF << 24) | (r << 16) | (g << 8) | b;

                image.setRGB(x, y, newRgb);
            }
        }

        return image;
    }

    private String decompressDicom(String inputPath) {

        try {

            String outputPath = inputPath.replace(".dcm", "_raw.dcm");

            ProcessBuilder pb = new ProcessBuilder(
                    "C:\\Users\\TJ\\Desktop\\GDCM-3.2.7-Windows-x86_64\\bin\\gdcmconv.exe",
                    "--raw",
                    inputPath,
                    outputPath
            );

            Process process = pb.start();

            int exit = process.waitFor();

            // 성공
            if (exit == 0 && new File(outputPath).exists()) {
                return outputPath;
            }

            // 실패
            throw new BusinessException(ErrorCode.GDCM_DECOMPRESS_FAILED);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.GDCM_DECOMPRESS_FAILED);

        } catch (IOException e) {
            throw new BusinessException(ErrorCode.GDCM_DECOMPRESS_FAILED);
        }
    }
}