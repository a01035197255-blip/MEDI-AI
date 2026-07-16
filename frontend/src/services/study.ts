import { apiClient } from './apiClient';
import {Gender} from "@/services/patient";

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export type Modality =
    | "CT"
    | "MR"
    | "CR"
    | "DX"
    | "US"
    | "PT"
    | "MG"
    | "SC";

export type Status =
    | "UPLOADED"
    | "PROCESSING"
    | "DONE"
    | "FAILED";

export interface StudyRequest {
    id?: number;
    patientId: number;
    modality: Modality;
    studyDate: string; // YYYY-MM-DD
    description?: string;
}

export interface StudyResponse {
    id: number;
    studyInstanceUid: string;
    modality: Modality;
    studyDate: string;
    description: string | null;
    status: Status;

    patientId: number;
    patientIdentifier: string;
    patientName: string;
    patientBirthDate: string | null;
    patientAge: number | null;
    patientSex: Gender | null;
    patientPhone: string;
}

export const StudyApi = {

    // =========================
    // 1. Study 생성
    // =========================
    create: async (
        patientId: number,
        data: StudyRequest
    ): Promise<StudyResponse> => {
        const res = await apiClient.post<ApiResponse<StudyResponse>>(
            `/api/study`,
            data,
            {
                params: { patientId },
            }
        );

        return res.data.data;
    },

    getByPatientId: async (
        patientId: number
    ): Promise<StudyResponse[]> => {

        const res = await apiClient.get<ApiResponse<StudyResponse[]>>(
            `/api/study/patient/${patientId}`
        );

        return res.data.data;
    },

    // =========================
    // 2. studyInstanceUid 조회
    // =========================
    getByUid: async (studyInstanceUid: string): Promise<StudyResponse> => {
        const res = await apiClient.get<ApiResponse<StudyResponse>>(
            `/api/study/${studyInstanceUid}`
        );

        return res.data.data;
    },

    // =========================
    // 3. 전체 조회
    // =========================
    getAll: async (): Promise<ApiResponse<StudyResponse[]>> => {
        const res = await apiClient.get<ApiResponse<StudyResponse[]>>(
            `/api/study`
        );

        return res.data;
    },
};