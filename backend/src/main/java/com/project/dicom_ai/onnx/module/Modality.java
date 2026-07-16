package com.project.dicom_ai.onnx.module;

import lombok.Getter;
import java.util.Arrays;

@Getter
public enum Modality {
    CR("Computed Radiography"),
    DX("Digital Radiography"),
    CT("Computed Tomography"),
    MR("Magnetic Resonance"),
    UNKNOWN("Unknown Modality");

    private final String description;

    Modality(String description) {
        this.description = description;
    }

    public static Modality fromString(String value) {
        if (value == null || value.isBlank()) return UNKNOWN;
        String sanitized = value.trim().toUpperCase();
        return Arrays.stream(values())
                .filter(m -> m.name().equals(sanitized))
                .findFirst()
                .orElse(UNKNOWN);
    }

    // CR과 DX는 둘 다 뼈/가슴 엑스레이에 사용되므로, 이를 체크하는 편의 메서드
    public boolean isXray() {
        return this == CR || this == DX;
    }
}
