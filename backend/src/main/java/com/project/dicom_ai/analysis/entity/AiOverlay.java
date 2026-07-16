package com.project.dicom_ai.analysis.entity;

import com.project.dicom_ai.image.entity.Image;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ai_overlay")
public class AiOverlay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // FK
    // =========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AiAnalysis analysis;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    // =========================
    // OVERLAY DATA
    // =========================
    private Integer sliceIndex;

    private Double bboxX;
    private Double bboxY;
    private Double bboxW;
    private Double bboxH;

    private Double confidence;
}