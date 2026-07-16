import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

/**
 * =========================
 * ENUMS
 * =========================
 */

export enum Modality {
    CT = "CT",
    MR = "MR",
    XRAY = "XRAY",
    US = "US",
    PET = "PET",
    OTHER = "OTHER",
}

export enum BodyPart {
    HEAD = "HEAD",
    BRAIN = "BRAIN",
    CHEST = "CHEST",
    LUNG = "LUNG",
    HEART = "HEART",
    ABDOMEN = "ABDOMEN",
    LIVER = "LIVER",
    PELVIS = "PELVIS",
    SPINE = "SPINE",
    EXTREMITY = "EXTREMITY",
    OTHER = "OTHER",
}

/**
 * =========================
 * REQUEST DTO
 * =========================
 */
export interface SeriesRequest {
    seriesInstanceUid: string;
    studyId: number;
    modality: Modality;
    bodyPart: BodyPart;
}

/**
 * =========================
 * RESPONSE DTO
 * =========================
 */
export interface SeriesResponse {
    id: number;
    seriesInstanceUid: string;
    modality: Modality;
    bodyPart: string;
    studyId: number;
}

/**
 * =========================
 * API
 * =========================
 */
export const SeriesApi = {
    // Series 생성
    create: async (
        studyInstanceUid: string,
        data: SeriesRequest
    ): Promise<ApiResponse<SeriesResponse>> => {
        const res = await apiClient.post<ApiResponse<SeriesResponse>>(
            `/api/series/studies/${studyInstanceUid}`,
            data
        );
        return res.data;
    },

    // StudyInstanceUID 기준 조회
    getByStudyInstanceUid: async (
        studyInstanceUid: string
    ): Promise<ApiResponse<SeriesResponse[]>> => {
        const res = await apiClient.get<ApiResponse<SeriesResponse[]>>(
            `/api/series/studies/${studyInstanceUid}`
        );
        return res.data;
    },

    // StudyId 기준 조회
    getByStudy: async (
        studyId: number
    ): Promise<ApiResponse<SeriesResponse[]>> => {
        const res = await apiClient.get<ApiResponse<SeriesResponse[]>>(
            `/api/series/study/${studyId}`
        );
        return res.data;
    },

    // 단건 조회
    get: async (id: number): Promise<ApiResponse<SeriesResponse>> => {
        const res = await apiClient.get<ApiResponse<SeriesResponse>>(
            `/api/series/${id}`
        );
        return res.data;
    },
};