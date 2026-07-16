package com.project.dicom_ai.onnx.module;

import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import jakarta.annotation.PreDestroy;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Getter
@Component
public class AiModelRegistry {

    private static final String MODEL_DIR = "models/";
    private static final String MODEL_EXTENSION = ".onnx";

    private final OrtEnvironment env = OrtEnvironment.getEnvironment();
    private final ConcurrentHashMap<MedicalModelTarget, CompletableFuture<OrtSession>> sessionRegistry = new ConcurrentHashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    public void initAllModelsAsync() {
        for (MedicalModelTarget target : MedicalModelTarget.values()) {
            if (target == MedicalModelTarget.UNKNOWN) {
                continue;
            }

            log.info("AI 모델 비동기 로딩 예약 완료: {}", target.name());
            sessionRegistry.put(target, loadSessionAsync(target));
        }
    }

    private CompletableFuture<OrtSession> loadSessionAsync(MedicalModelTarget target) {

        return CompletableFuture.supplyAsync(() -> {

            String modelPath = MODEL_DIR + target.name().toLowerCase() + MODEL_EXTENSION;

            log.info("AI 모델 로딩 시작: {}", modelPath);

            try (InputStream is = getClass().getClassLoader().getResourceAsStream(modelPath)) {

                if (is == null) {
                    throw new IllegalArgumentException("모델 파일을 찾을 수 없습니다: " + modelPath);
                }

                byte[] modelBytes = is.readAllBytes();
                OrtSession session = env.createSession(modelBytes, new OrtSession.SessionOptions());

                log.info("AI 모델 로딩 성공: {}", modelPath);
                return session;

            } catch (Exception e) {
                log.error("AI 모델 로딩 실패: {}", modelPath, e);
                throw new RuntimeException(e);
            }
        });
    }

    public OrtSession getSession(MedicalModelTarget target) {

        CompletableFuture<OrtSession> future = sessionRegistry.get(target);

        if (future == null) {
            throw new IllegalArgumentException("등록되지 않은 모델입니다: " + target);
        }

        try {
            return future.join();
        } catch (Exception e) {
            throw new IllegalStateException("모델 세션 획득 실패: " + target, e);
        }
    }

    @PreDestroy
    public void close() {

        log.info("AI 모델 자원 반환 시작");

        sessionRegistry.values().forEach(future -> {
            try {
                if (future.isDone()) {
                    future.join().close();
                }
            } catch (Exception ignored) {
            }
        });

        env.close();

        log.info("AI 모델 자원 반환 완료");
    }
}