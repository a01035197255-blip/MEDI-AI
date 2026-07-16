package com.project.dicom_ai.analysis.entity;

import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.series.entity.Series;
import com.project.dicom_ai.study.entity.Study;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ai_analysis")
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // FK
    // =========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id")
    private Series series;

    // =========================
    // RESULT
    // =========================
    @Lob
    private String overallImpression;

    @Column(length = 100)
    private String modelName;

    @Column(length = 50)
    private String modelVersion;

    private Long processingTimeMs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagnosisResult diagnosisResult;

    // =========================
    // STATUS
    // =========================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;

    // =========================
    // RELATION
    // =========================
    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AiFinding> findings = new ArrayList<>();


    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AiOverlay> overlays = new ArrayList<>();

    // =========================
    // SYSTEM
    // =========================
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}