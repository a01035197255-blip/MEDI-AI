package com.project.dicom_ai.series.entity;

import com.project.dicom_ai.image.entity.Image;
import com.project.dicom_ai.study.entity.Study;
import lombok.Getter;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "series")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class    Series {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "series_instance_uid",
            nullable = false,
            length = 128
    )
    private String seriesInstanceUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "study_id",
            nullable = false
    )
    private Study study;

    @OneToMany(
            mappedBy = "series",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Image> images = new ArrayList<>();

    @Column(name = "series_number")
    private Integer seriesNumber;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "body_part",
            length = 20
    )
    private BodyPart bodyPart;

    public Series(String seriesInstanceUid,
                  Integer seriesNumber,
                  BodyPart bodyPart,
                  Study study) {
        this.seriesInstanceUid = seriesInstanceUid;
        this.seriesNumber = seriesNumber;
        this.bodyPart = bodyPart;
        this.study = study;
    }
}