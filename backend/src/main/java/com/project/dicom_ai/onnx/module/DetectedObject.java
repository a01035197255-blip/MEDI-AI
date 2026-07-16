package com.project.dicom_ai.onnx.module;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
@AllArgsConstructor
public class DetectedObject {

    // 1. 분류 정보
    private final String label;       // 탐지된 병명 또는 부위 (예: "BF", "BT", "BRAIN_TUMOR")
    private final float confidence;   // AI 모델이 확신하는 신뢰도 스코어 (0.0 ~ 1.0)

    // 2. 바운딩 박스 좌표 (YOLO 기본 출력 포맷: 좌상단 X, Y / 우상단 X, Y)
    private final float xMin;
    private final float yMin;
    private final float xMax;
    private final float yMax;

    /**
     * 픽셀 기반의 절대 크기로 변환된 사각형 영역이 필요할 때
     * 바로 객체를 뽑아 쓸 수 있도록 돕는 내부 레코드(또는 가상 DTO)
     */
    public BoxDimensions toAbsolutePixels(int imageWidth, int imageHeight) {

        return new BoxDimensions(
                Math.round(this.xMin * imageWidth),
                Math.round(this.yMin * imageHeight),
                Math.round((this.xMax - this.xMin) * imageWidth),
                Math.round((this.yMax - this.yMin) * imageHeight)
        );
    }
        public record BoxDimensions(int x, int y, int width, int height) {
    }
}