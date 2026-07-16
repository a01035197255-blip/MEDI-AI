package com.project.dicom_ai.dicom.entity;

import com.project.dicom_ai.study.entity.Study;
import com.project.dicom_ai.series.entity.Series;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "dicom_file",
        indexes = {
                @Index(name = "idx_sop_instance_uid", columnList = "sop_instance_uid"),
                @Index(name = "idx_series_id", columnList = "series_id"),
                @Index(name = "idx_study_id", columnList = "study_id")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DicomFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Study 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    // Series 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    // 슬라이스 순서
    @Column(name = "instance_number")
    private Integer instanceNumber;

    // SOP Class UID (CT, MR 등 타입 정의)
    @Column(name = "sop_class_uid")
    private String sopClassUid;

    // DICOM 고유 ID
    @Column(name = "sop_instance_uid", unique = true, nullable = false)
    private String sopInstanceUid;

    // 실제 파일 저장 경로
    @Column(name = "file_path", nullable = false)
    private String filePath;

    // 원본 파일명
    @Column(name = "original_filename")
    private String originalFilename;

    // 업로드 시간
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = LocalDateTime.now();
    }
}

