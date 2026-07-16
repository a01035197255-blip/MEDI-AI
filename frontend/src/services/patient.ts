import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export type Gender = "M" | "F";

export interface PatientRequest {
    id?: number;
    name: string;
    phone: string;
    birthDate: string; // ISO string (YYYY-MM-DD)
    gender: Gender;
}

export interface PatientResponse {
    id: number;
    patientIdentifier: string;
    name: string;
    birthDate: string | null;
    phone: string;
    gender: Gender | null;
    createdAt: string;
}

export const PatientApi = {

    create: async (data: PatientRequest): Promise<PatientResponse> => {
        const res = await apiClient.post<ApiResponse<PatientResponse>>(
            "/api/patients",
            data
        );
        return res.data.data;
    },

    getById: async (id: number): Promise<PatientResponse> => {
        const res = await apiClient.get<ApiResponse<PatientResponse>>(
            `/api/patients/${id}`
        );

        return res.data.data;
    },

    getAll: async (): Promise<PatientResponse[]> => {
        const res = await apiClient.get<ApiResponse<PatientResponse[]>>(
            "/api/patients"
        );
        return res.data.data;
    },

    getByIdentifier: async (patientIdentifier: string): Promise<PatientResponse> => {
        const res = await apiClient.get<ApiResponse<PatientResponse>>(
            `/api/patients/identifier/${patientIdentifier}`
        );
        return res.data.data;
    },

    search: async (keyword: string): Promise<PatientResponse[]> => {
        const res = await apiClient.get<ApiResponse<PatientResponse[]>>(
            "/api/patients/search",
            { params: { keyword } }
        );
        return res.data.data;
    },
};