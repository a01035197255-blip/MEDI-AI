package com.project.dicom_ai.onnx;

import com.project.dicom_ai.onnx.module.DetectedObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai/predict")
public class DicomAiController {

    private final InferenceService inferenceService;

    @PostMapping("/pacs")
    public CompletableFuture<ResponseEntity<List<List<DetectedObject>>>> processPacsImage(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("bodyPart") String bodyPart) {

        log.info("[PACS 요청 수신] 톰캣 스레드 블로킹 해제 시작 - 파일 개수: {}", files.length);

        return inferenceService.processImagesAsync(files, bodyPart)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    log.error("PACS 비동기 추론 실패 처리: {}", ex.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                });
    }

    @PostMapping( value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CompletableFuture<ResponseEntity<List<List<DetectedObject>>>> processUploadedImage(
            @RequestParam("dicom") MultipartFile[] files,
            @RequestParam("part") String part) {

        log.info("[웹 업로드 요청 수신] 톰캣 스레드 블로킹 해제 시작 - 요청 모델: {}", part);

        return inferenceService.processImagesAsync(files, part)
                .thenApply(ResponseEntity::ok)
                .exceptionally(ex -> {
                    log.error("업로드 비동기 추론 실패 처리: {}", ex.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                });
    }
}