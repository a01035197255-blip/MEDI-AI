package com.project.dicom_ai.onnx.module;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Tag;
import org.dcm4che3.imageio.plugins.dcm.DicomImageReaderSpi;
import org.dcm4che3.imageio.plugins.dcm.DicomMetaData;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.awt.image.Raster;
import java.io.ByteArrayInputStream;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class ImageProcessor {

    private static final float CONFIDENCE_THRESHOLD = 0.45f;
    private static final float NMS_IOU_THRESHOLD = 0.30f;
    private static final float MODEL_INPUT_SIZE = 640.0f; // YOLOv8 좌표계 기준 스케일 상수

    // 💡 텐서와 동적 원본 해상도를 안전하게 묶어 나를 주머니(DTO) 선언
    public record PreprocessResult(OnnxTensor tensor, int origW, int origH) {}

    public PreprocessResult preprocess(byte[] bytes, int size, OrtEnvironment env) throws Exception {
        ImageReader reader = new DicomImageReaderSpi().createReaderInstance();
        Attributes metadata;
        Raster raster;

        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             ImageInputStream iis = ImageIO.createImageInputStream(bais)) {
            reader.setInput(iis);
            DicomMetaData dicomMetaData = (DicomMetaData) reader.getImageMetadata(0);

            if (dicomMetaData != null) {
                metadata = dicomMetaData.getAttributes();
            } else {
                try (org.dcm4che3.io.DicomInputStream dis = new org.dcm4che3.io.DicomInputStream(new ByteArrayInputStream(bytes))) {
                    metadata = dis.readDataset(-1, -1);
                }
            }
            raster = reader.readRaster(0, null);
        } finally {
            reader.dispose();
        }

        int rows = raster.getHeight();
        int cols = raster.getWidth();
        int totalPixels = cols * rows;

        // 1. DICOM pixel 데이터 추출
        int[] pixels = new int[totalPixels];
        raster.getSamples(0, 0, cols, rows, 0, pixels);

        // 2. Pixel Min/Max 탐색 및 반전 여부 확인
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        for (int pixel : pixels) {
            min = Math.min(min, pixel);
            max = Math.max(max, pixel);
        }

        boolean invert = "MONOCHROME1".equals(metadata.getString(Tag.PhotometricInterpretation));

        // 3. 8비트 정규화 및 RGB 변환
        BufferedImage image = new BufferedImage(cols, rows, BufferedImage.TYPE_INT_RGB);
        int[] rgb = ((DataBufferInt) image.getRaster().getDataBuffer()).getData();
        int range = max - min;

        for (int i = 0; i < totalPixels; i++) {
            int normalized = (range == 0) ? 0 : (pixels[i] - min) * 255 / range;
            if (invert) {
                normalized = 255 - normalized;
            }
            rgb[i] = (normalized << 16) | (normalized << 8) | normalized;
        }

        // 4. 이미지 리사이즈
        BufferedImage resized = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(image, 0, 0, size, size, null);
        } finally {
            g.dispose();
        }

        // 5. NCHW 텐서 변환
        int stride = size * size;
        float[] tensorData = new float[3 * stride];
        int[] resizedPixels = ((DataBufferInt) resized.getRaster().getDataBuffer()).getData();

        for (int i = 0; i < stride; i++) {
            float value = ((resizedPixels[i] >> 16) & 0xFF) / 255.0f;
            tensorData[i] = value;
            tensorData[stride + i] = value;
            tensorData[stride * 2 + i] = value;
        }

        // 💡 [변경포인트] OnnxTensor 객체와 동적으로 읽어온 원본 크기(cols, rows)를 주머니에 담아 반환
        OnnxTensor onnxTensor = OnnxTensor.createTensor(env, FloatBuffer.wrap(tensorData), new long[]{1, 3, size, size});
        return new PreprocessResult(onnxTensor, cols, rows);
    }

    // 💡 [변경포인트] 파라미터로 원본 이미지의 가로(origW)와 세로(origH)를 추가로 받습니다.
    public List<DetectedObject> postprocess(float[][][] outputData, List<String> modelLabels, int origW, int origH) {
        List<DetectedObject> detections = new ArrayList<>();

        if (outputData == null || outputData.length == 0 || modelLabels.isEmpty()) {
            return detections;
        }

        System.out.println(outputData[0].length);
        System.out.println(outputData[0][0].length);
        int numBoxes = outputData[0].length;
        int numElements = outputData[0][0].length;

        for (int i = 0; i < numElements; i++) {
            float maxScore = 0.0f;
            int classId = -1;

            for (int j = 4; j < numBoxes; j++) {
                float score = outputData[0][j][i];
                if (score > maxScore) {
                    maxScore = score;
                    classId = j - 4;
                }
            }

            if (maxScore >= CONFIDENCE_THRESHOLD && classId < modelLabels.size()) {
                float cx = outputData[0][0][i];
                float cy = outputData[0][1][i];
                float w = outputData[0][2][i];
                float h = outputData[0][3][i];

                System.out.println(
                        "YOLO RAW cx="+cx+
                                " cy="+cy+
                                " w="+w+
                                " h="+h
                );

                // 💡 [핵심 연산] 640 그리드 좌표계를 매번 들어오는 원본 해상도(origW, origH)에 맞춰 자동 스케일 업 역산
                float xMin = (cx - (w / 2.0f)) / MODEL_INPUT_SIZE * origW;
                float yMin = (cy - (h / 2.0f)) / MODEL_INPUT_SIZE * origH;
                float xMax = (cx + (w / 2.0f)) / MODEL_INPUT_SIZE * origW;
                float yMax = (cy + (h / 2.0f)) / MODEL_INPUT_SIZE * origH;

                // ↓↓↓ 여기 추가
                System.out.println(
                        "IMAGE SIZE = " + origW + " x " + origH
                );

                System.out.println(
                        "BOX = xMin=" + xMin +
                                ", yMin=" + yMin +
                                ", xMax=" + xMax +
                                ", yMax=" + yMax
                );

                detections.add(DetectedObject.builder()
                        .label(modelLabels.get(classId))
                        .confidence(maxScore)
                        .xMin(Math.max(0f, xMin))
                        .yMin(Math.max(0f, yMin))
                        .xMax(Math.min(origW, xMax))
                        .yMax(Math.min(origH, yMax))
                        .build());
            }
        }
        return applyNMS(detections);
    }

    private List<DetectedObject> applyNMS(List<DetectedObject> boxes) {
        List<DetectedObject> nmsResults = new ArrayList<>();
        boxes.sort(Comparator.comparingDouble(DetectedObject::getConfidence).reversed());
        boolean[] isSuppressed = new boolean[boxes.size()];

        for (int i = 0; i < boxes.size(); i++) {
            if (isSuppressed[i]) continue;
            DetectedObject baseBox = boxes.get(i);
            nmsResults.add(baseBox);

            for (int j = i + 1; j < boxes.size(); j++) {
                if (!isSuppressed[j] && baseBox.getLabel().equals(boxes.get(j).getLabel())) {
                    if (calculateIoU(baseBox, boxes.get(j)) > NMS_IOU_THRESHOLD) {
                        isSuppressed[j] = true;
                    }
                }
            }
        }
        return nmsResults;
    }

    private float calculateIoU(DetectedObject box1, DetectedObject box2) {
        float xMinInter = Math.max(box1.getXMin(), box2.getXMin());
        float yMinInter = Math.max(box1.getYMin(), box2.getYMin());
        float xMaxInter = Math.min(box1.getXMax(), box2.getXMax());
        float yMaxInter = Math.min(box1.getYMax(), box2.getYMax());

        float interWidth = Math.max(0, xMaxInter - xMinInter);
        float interHeight = Math.max(0, yMaxInter - yMinInter);
        float interArea = interWidth * interHeight;

        float box1Area = (box1.getXMax() - box1.getXMin()) * (box1.getYMax() - box1.getYMin());
        float box2Area = (box2.getXMax() - box2.getXMin()) * (box2.getYMax() - box2.getYMin());
        float unionArea = box1Area + box2Area - interArea;

        return unionArea == 0 ? 0f : interArea / unionArea;
    }
}