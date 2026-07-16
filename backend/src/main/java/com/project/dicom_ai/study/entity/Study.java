package com.project.dicom_ai.study.entity;

import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.patient.entity.Patient;
import com.project.dicom_ai.series.entity.Series;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "study")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Study {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DICOM Study Instance UID
    @Column(name = "study_instance_uid", nullable = true, unique = true)
    private String studyInstanceUid;

    // FK -> Patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL)
    private List<Series> series = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "modality", nullable = false)
    private Modality modality;

    @Column(name = "study_date")
    private LocalDate studyDate;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Study(String studyInstanceUid,
                 Patient patient,
                 Modality modality,
                 LocalDate studyDate,
                 String description,
                 Status status) {
        this.studyInstanceUid = studyInstanceUid;
        this.patient = patient;
        this.modality = modality;
        this.studyDate = studyDate;
        this.description = description;
        this.status = status;
    }
}