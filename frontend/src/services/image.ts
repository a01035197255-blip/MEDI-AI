import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export enum ImageType {
    ORIGINAL = "ORIGINAL",
    DERIVED = "DERIVED",
    SC = "SC",
}

export interface ImageRequest {
    // =========================
    // DICOM IDENTIFIER
    // =========================
    sopInstanceUid: string;
    seriesId: number;
    imageType: ImageType;

    // =========================
    // FILE INFO
    // =========================
    filePath: string;
    originalFilename: string;

    // =========================
    // ORDERING
    // =========================
    instanceNumber: number;

    // =========================
    // VIEWER (WINDOW LEVEL)
    // =========================
    windowCenter?: number;
    windowWidth?: number;

    // =========================
    // CT / AI CORE METADATA
    // =========================
    rows?: number;
    columns?: number;

    pixelSpacingX?: number;
    pixelSpacingY?: number;

    rescaleSlope?: number;
    rescaleIntercept?: number;
}

export interface ImageResponse {
    // =========================
    // BASIC INFO
    // =========================
    id: number;
    sopInstanceUid: string;
    seriesId: number;
    imageType: ImageType | string;

    // =========================
    // FILE INFO
    // =========================
    filePath: string;
    originalFilename: string;

    // =========================
    // ORDERING
    // =========================
    instanceNumber: number;

    // =========================
    // VIEWER (WINDOW LEVEL)
    // =========================
    windowCenter?: number;
    windowWidth?: number;

    // =========================
    // CT / AI CORE METADATA
    // =========================
    rows?: number;
    columns?: number;

    pixelSpacingX?: number;
    pixelSpacingY?: number;

    rescaleSlope?: number;
    rescaleIntercept?: number;

    // =========================
    // SYSTEM
    // =========================
    uploadedAt: string;
}

export const ImageApi = {
    create: async (
        data: ImageRequest
    ): Promise<ApiResponse<ImageResponse>> => {
        const res = await apiClient.post<ApiResponse<ImageResponse>>(
            "/api/images",
            data
        );
        return res.data;
    },

    getSeriesImages: async (
        seriesId: number
    ): Promise<ApiResponse<ImageResponse[]>> => {
        const res = await apiClient.get<ApiResponse<ImageResponse[]>>(
            `/api/images/series/${seriesId}`
        );
        return res.data;
    },

    getByUid: async (
        sopInstanceUid: string
    ): Promise<ApiResponse<ImageResponse>> => {
        const res = await apiClient.get<ApiResponse<ImageResponse>>(
            `/api/images/uid/${sopInstanceUid}`
        );
        return res.data;
    },

    get: async (
        id: number
    ): Promise<ApiResponse<ImageResponse>> => {
        const res = await apiClient.get<ApiResponse<ImageResponse>>(
            `/api/images/${id}`
        );
        return res.data;
    },
};