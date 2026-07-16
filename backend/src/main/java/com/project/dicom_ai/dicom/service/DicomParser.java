package com.project.dicom_ai.dicom.service;

import com.project.dicom_ai.image.entity.ImageType;
import com.project.dicom_ai.patient.entity.Gender;
import com.project.dicom_ai.series.entity.BodyPart;
import com.project.dicom_ai.study.entity.Modality;

import java.time.LocalDate;

public class DicomParser {

    public static LocalDate parseBirthDate(String bd) {
        if (bd == null || bd.length() != 8) return null;

        return LocalDate.parse(
                bd.substring(0, 4) + "-" +
                        bd.substring(4, 6) + "-" +
                        bd.substring(6, 8)
        );
    }

    public static Gender parseGender(String sex) {
        if (sex == null) return null;

        return switch (sex) {
            case "M" -> Gender.M;
            case "F" -> Gender.F;
            default -> Gender.O;
        };
    }

    public static LocalDate parseStudyDate(String date) {
        if (date == null || date.length() != 8) return null;

        return LocalDate.parse(
                date.substring(0, 4) + "-" +
                        date.substring(4, 6) + "-" +
                        date.substring(6, 8)
        );
    }

    public static Modality parseModality(String m) {
        if (m == null) return null;

        return switch (m) {
            case "CT" -> Modality.CT;
            case "MR" -> Modality.MR;
            case "CR" -> Modality.CR;
            case "DX" -> Modality.DX;
            case "US" -> Modality.US;
            case "PT" -> Modality.PT;
            case "MG" -> Modality.MG;
            case "SC" -> Modality.SC;
            default -> null; // or UNKNOWN
        };
    }
    public static Integer parseInt(String v) {
        try {
            return v != null ? Integer.parseInt(v) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public static BodyPart parseBodyPart(String v) {
        if (v == null || v.isBlank()) return BodyPart.OTHER;

        String value = v.toUpperCase().trim();

        return switch (value) {
            case "HEAD" -> BodyPart.HEAD;
            case "BRAIN" -> BodyPart.BRAIN;

            case "CHEST" -> BodyPart.CHEST;
            case "LUNG", "LUNGS" -> BodyPart.LUNG;

            case "HEART" -> BodyPart.HEART;

            case "ABDOMEN", "ABD" -> BodyPart.ABDOMEN;
            case "LIVER" -> BodyPart.LIVER;

            case "PELVIS" -> BodyPart.PELVIS;

            case "SPINE", "C-SPINE", "L-SPINE", "T-SPINE" -> BodyPart.SPINE;

            case "ARM", "UPPER EXTREMITY", "LOWER EXTREMITY",
                 "LEG", "EXTREMITY" -> BodyPart.EXTREMITY;

            default -> BodyPart.OTHER;
        };
    }

    public static Double parseDouble(String v) {
        try {
            return v != null ? Double.parseDouble(v) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public static Double parsePixelSpacingX(String[] spacing) {
        if (spacing == null || spacing.length < 2) {
            return null;
        }

        try {
            return Double.parseDouble(spacing[0]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static Double parsePixelSpacingY(String[] spacing) {
        if (spacing == null || spacing.length < 2) {
            return null;
        }

        try {
            return Double.parseDouble(spacing[1]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static ImageType parseImageType(String[] imageTypes) {

        if (imageTypes == null || imageTypes.length == 0) {
            return null;
        }

        String type = imageTypes[0];

        if ("ORIGINAL".equalsIgnoreCase(type)) {
            return ImageType.ORIGINAL;
        }

        if ("DERIVED".equalsIgnoreCase(type)) {
            return ImageType.DERIVED;
        }

        if ("SC".equalsIgnoreCase(type)) {
            return ImageType.SC;
        }

        return null;
    }

    // =========================
    // WC/WW multi-value 파싱
    // =========================
    public static float parseFirstFloat(String[] arr) {
        if (arr == null || arr.length == 0) return 0f;
        try {
            return Float.parseFloat(arr[0].split("\\\\")[0]);
        } catch (Exception e) {
            return 0f;
        }
    }
}
