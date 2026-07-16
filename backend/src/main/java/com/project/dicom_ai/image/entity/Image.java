package com.project.dicom_ai.image.entity;

import com.project.dicom_ai.series.entity.Series;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DICOM 고유 ID
    @Column(name = "sop_instance_uid", nullable = false, unique = true)
    private String sopInstanceUid;

    // Series 연결 (PACS 핵심 구조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    // ORIGINAL = 원본 DICOM, SC = secondary capture (변환 이미지)
    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", nullable = false)
    private ImageType imageType;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    // ⭐ 핵심: 파일 저장 경로 (DB에는 이것만 저장)
    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "PngPath")
    private String PngPath;

    // DICOM 순서 (슬라이스 순서)
    @Column(name = "instance_number")
    private Integer instanceNumber;

    @Column(name = "sop_class_uid")
    private String sopClassUid;

    // CT/MRI 밝기 조절 값
    @Column(name = "window_center")
    private Double windowCenter;

    @Column(name = "window_width")
    private Double windowWidth;

    @Column(name = "rows")
    private Integer rows;

    @Column(name = "columns")
    private Integer columns;

    // pixel spacing (mm)
    @Column(name = "pixel_spacing_x")
    private Double pixelSpacingX;

    @Column(name = "pixel_spacing_y")
    private Double pixelSpacingY;

    // CT HU conversion
    @Column(name = "rescale_slope")
    private Double rescaleSlope;

    @Column(name = "rescale_intercept")
    private Double rescaleIntercept;

    // =========================
    // AUDIT
    // =========================
    @Column(name = "uploaded_at", updatable = false)
    private java.time.LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = java.time.LocalDateTime.now();
    }

    public Image(String sopInstanceUid,
                 Series series,
                 ImageType imageType,
                 String filePath,
                 Integer instanceNumber,
                 Integer rows,
                 Integer columns,
                 Double windowCenter,
                 Double windowWidth,
                 Double pixelSpacingX,
                 Double pixelSpacingY,
                 Double rescaleSlope,
                 Double rescaleIntercept,
                 String originalFilename) {

        this.sopInstanceUid = sopInstanceUid;
        this.series = series;
        this.imageType = imageType;
        this.filePath = filePath;
        this.instanceNumber = instanceNumber;
        this.rows = rows;
        this.columns = columns;
        this.windowCenter = windowCenter;
        this.windowWidth = windowWidth;
        this.pixelSpacingX = pixelSpacingX;
        this.pixelSpacingY = pixelSpacingY;
        this.rescaleSlope = rescaleSlope;
        this.rescaleIntercept = rescaleIntercept;
        this.originalFilename = originalFilename;
    }
}