package com.project.dicom_ai.onnx.module;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.Map;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "medical-models")
public class ModelConfigProperties {

    private Map<String, ModelConfig> config;

    @Getter
    @Setter
    public static class ModelConfig {
        private String path;
        private int imgSize;
    }
}