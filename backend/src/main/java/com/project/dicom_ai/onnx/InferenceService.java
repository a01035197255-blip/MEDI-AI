package com.project.dicom_ai.onnx;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtSession;
import com.project.dicom_ai.onnx.module.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class InferenceService {

    private final ModelConfigProperties modelProperties;
    private final AiModelRegistry modelRegistry;
    private final ImageProcessor imageProcessor;
    private final ThreadPoolTaskExecutor aiTaskExecutor;

    public CompletableFuture<List<List<DetectedObject>>> processImagesAsync(MultipartFile[] files, String bodyPart) {
        MedicalModelTarget target = MedicalModelTarget.findModel(bodyPart);
        log.info("target {}", target.name());
        if (target == MedicalModelTarget.UNKNOWN) {
            return CompletableFuture.failedFuture(new IllegalArgumentException("지원하지 않는 모델 조건입니다."));
        }
        return CompletableFuture.supplyAsync(() -> triggerPipeline(files, target), aiTaskExecutor);
    }

    private List<List<DetectedObject>> triggerPipeline(MultipartFile[] files, MedicalModelTarget target) {
        log.info("========== triggerPipeline 시작 ==========");

        ModelConfigProperties.ModelConfig config = modelProperties.getConfig().get(target.name());
        if (config == null) {
            throw new IllegalArgumentException("등록되지 않은 모델: " + target.name());
        }

        log.info("1. 모델 설정 조회 완료");

        List<byte[]> fileBytesList = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                fileBytesList.add(file.getBytes());
            } catch (Exception e) {
                throw new IllegalArgumentException("파일 읽기 실패", e);
            }
        }

        log.info("2. MultipartFile -> byte[] 변환 완료 ({}개)", fileBytesList.size());
        List<List<DetectedObject>> totalResults = new ArrayList<>();

        try {
            log.info("3. ONNX Session 가져오기");
            OrtSession session = modelRegistry.getSession(target);
            log.info("4. Session 획득 완료");

            List<String> modelLabels = ModelLabelMapper.getLabels(target.name());
            log.info("5. Label 개수 : {}", modelLabels.size());

            for (int i = 0; i < fileBytesList.size(); i++) {
                log.info("========== {}번째 파일 시작 ==========", i + 1);
                byte[] fileBytes = fileBytesList.get(i);

                try {
                    log.info("6. preprocess 시작");

                    // 💡 [변경포인트 1] 리턴 타입이 OnnxTensor에서 주머니인 ImageProcessor.PreprocessResult로 변경되었습니다.
                    ImageProcessor.PreprocessResult preOut = imageProcessor.preprocess(
                            fileBytes,
                            config.getImgSize(),
                            modelRegistry.getEnv()
                    );

                    log.info("7. preprocess 완료 (원본 해상도: {}x{})", preOut.origW(), preOut.origH());

                    // 💡 [변경포인트 2] try-with-resources 내부에 주머니가 들고 있던 inputTensor를 꺼내서 할당합니다.
                    try (OnnxTensor inputTensor = preOut.tensor()) {
                        log.info("8. session.run 시작");
                        OrtSession.Result results = session.run(Map.of("images", inputTensor));
                        log.info("9. session.run 완료");

                        float[][][] outputData = (float[][][]) results.get(0).getValue();
                        log.info("10. output 추출 완료");

                        // 💡 [변경포인트 3] postprocess 호출 시 주머니(preOut)에 박혀있던 원본 가로, 세로 값을 자동으로 꺼내서 찔러넣어 줍니다.
                        List<DetectedObject> singleResult = imageProcessor.postprocess(
                                outputData,
                                modelLabels,
                                preOut.origW(),
                                preOut.origH()
                        );

                        log.info("11. postprocess 완료 ({}개)", singleResult.size());
                        totalResults.add(singleResult);
                        results.close();
                    }

                    log.info("========== {}번째 파일 종료 ==========", i + 1);
                } catch (Exception e) {
                    log.error("개별 파일 처리 실패", e);
                    totalResults.add(Collections.emptyList());
                }
            }
            log.info("12. 모든 파일 처리 완료");
        } catch (Exception e) {
            log.error("치명적 오류", e);
            throw new RuntimeException("AI 연산 실패", e);
        }

        log.info("========== triggerPipeline 종료 ==========");
        return totalResults;
    }
}