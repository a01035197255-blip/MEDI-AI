package com.project.dicom_ai.patient.entity;

import com.project.dicom_ai.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // DICOM PatientID
    @Column(name = "patient_identifier", nullable = true, unique = true)
    private String patientIdentifier;

    @Column(name = "name")
    private String name;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "phone")
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 자동 시간 세팅
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Patient(String patientIdentifier,
                   String name,
                   String phone,
                   LocalDate birthDate,
                   Gender gender) {
        this.patientIdentifier = patientIdentifier;
        this.name = name;
        this.birthDate = birthDate;
        this.phone = phone;
        this.gender = gender;
    }

    public Integer getAge() {
        if (birthDate == null) return null;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}