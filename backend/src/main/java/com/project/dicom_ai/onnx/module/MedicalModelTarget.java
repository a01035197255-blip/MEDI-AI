package com.project.dicom_ai.onnx.module;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum MedicalModelTarget {
    BRAIN_TUMOR(Modality.CT, "BRAIN", "models/brain_tumor.onnx"),
    CHEST_DISEASE(Modality.CT, "CHEST", "models/chest_disease.onnx"),
    BREAST_CANCER(Modality.CR, "BREAST", "models/breast_cancer.onnx"),
    BONE_FRACTURE(Modality.CR, "BF", "models/bone_fracture.onnx"),
    BONE_TUMOR(Modality.CR, "BT", "models/bone_tumor.onnx"),

    UNKNOWN(Modality.UNKNOWN, "NONE", null);

    private final Modality modality; // String 대신 우리가 만든 Enum 사용
    private final String descriptionKeyword;
    private final String modelPath;

    public static MedicalModelTarget findModel(String description) {
        Modality inputModality = findModalityByBodyPart(description);

        if (inputModality == Modality.UNKNOWN) return UNKNOWN;

        String descUpper = description != null ? description.toUpperCase() : "";

        for (MedicalModelTarget target : values()) {
            if (!descUpper.contains(target.descriptionKeyword)) {
                continue;
            }

            if (target.modality == inputModality) {
                return target;
            }

            if (target.modality.isXray() && inputModality.isXray()) {
                return target;
            }
        }
        return UNKNOWN;
    }

    private static Modality findModalityByBodyPart(String description) {
        if (description == null) {
            return Modality.UNKNOWN;
        }

        String trimmedPart = description.toUpperCase().trim();
        for (MedicalModelTarget target : values()) {
            if (target.descriptionKeyword.equals(trimmedPart)) {
                return target.modality;
            }
        }
        return Modality.UNKNOWN;
    }
}