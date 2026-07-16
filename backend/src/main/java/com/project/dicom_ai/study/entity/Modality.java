package com.project.dicom_ai.study.entity;

// =========================
// ENUM: Modality
// =========================
public enum Modality {
    CT,
    MR,   // MRI 아님 (MR이 정식)
    CR,   // Computed Radiography (X-ray 계열)
    DX,   // Digital Radiography (현대 X-ray)
    US,
    PT,
    SC ,
    MG
}