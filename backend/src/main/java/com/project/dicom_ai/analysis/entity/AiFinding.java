package com.project.dicom_ai.analysis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ai_finding")
public class AiFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // FK
    // =========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AiAnalysis analysis;

    // =========================
    // DATA
    // =========================
    private Integer sliceIndex;

    @Column(length = 100)
    private String label;

    @Column(length = 100)
    private String labelKo;

    @Lob
    private String description;

    private Double confidence;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
}