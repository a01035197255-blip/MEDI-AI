package com.project.dicom_ai.onnx.module;

import java.util.List;
import java.util.Map;

public class ModelLabelMapper {
    private static final Map<String, List<String>> LABEL_MAP = Map.of(
            "BRAIN_TUMOR", List.of("Glioma", "Meningioma", "Pituitary"),

            "CHEST_DISEASE", List.of("Aortic enlargement", "Atelectasis", "Calcification", "Cardiomegaly",
                    "Consolidation", "ILD", "Infiltration", "Lung Opacity", "Nodule/Mass",
                    "Other lesion", "Pleural effusion", "Pleural thickening", "Pneumothorax",
                    "Pulmonary fibrosis", "No finding"),

            "BREAST_CANCER", List.of("cancer", "normal"),

            "BONE_TUMOR", List.of("giant cell tumor", "multiple osteochondromas", "osteochondroma",
                    "osteofibroma", "osteosarcoma", "other bt", "other mt",
                    "simple bone cyst", "synovial osteochondroma"),

            "BONE_FRACTURE", List.of("fracture", "normal")
    );

    public static List<String> getLabels(String part) {
        return LABEL_MAP.getOrDefault(part, List.of());
    }
}
