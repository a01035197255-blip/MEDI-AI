import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export interface DicomUploadResult {
    filePath: string;
    originalFilename: string;

    patientIdentifier: string;
    patientName: string;
    patientBirthDate: string;
    patientSex: string;

    studyInstanceUid: string;
    studyDate: string;
    studyTime: string;
    modality: string;
    studyDescription: string;

    seriesInstanceUid: string;
    seriesNumber: number;
    seriesDescription: string;
    bodyPart: string;

    pngPath: string;

    sopInstanceUid: string;
    sopClassUid: string;
    imageType: string;
    instanceNumber: number;

    rows?: number;
    columns?: number;

    windowCenter?: number;
    windowWidth?: number;

    pixelSpacingX?: number;
    pixelSpacingY?: number;

    rescaleSlope?: number;
    rescaleIntercept?: number;
}

export interface DicomFileResponse {
    id: number;

    studyInstanceUid: string;
    seriesInstanceUid: string;

    instanceNumber: number;
    sopClassUid: string;
    sopInstanceUid: string;

    filePath: string;
    originalFilename: string;
}

export const DicomApi = {
    // =========================
    // 업로드
    // =========================
    upload: async (
        file: File,
        patientId: number,
        studyId: number
    ): Promise<ApiResponse<DicomUploadResult>> => {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("patientId", String(patientId));
        formData.append("studyId", String(studyId));

        const res = await apiClient.post<ApiResponse<DicomUploadResult>>(
            "/api/dicom/upload",
            formData,
            {
                headers: {"Content-Type": "multipart/form-data"}
            }
        );

        return res.data;
    },

    // ZIP DICOM 업로드
    uploadZip: async (
        zipFile: File,
        patientId: number,
        studyId: number
    ): Promise<DicomUploadResult[]> => {

        const formData = new FormData();

        formData.append("file", zipFile);
        formData.append("patientId", patientId.toString());
        formData.append("studyId", studyId.toString());

        const response =
            await apiClient.post<ApiResponse<DicomUploadResult[]>>(
                "/api/dicom/upload/zip",
                formData,

            );
        return response.data.data;
    },

    // =========================
    // 배치 업로드
    // =========================
    uploadBatch: async (
        files: File[],
        patientId: number,
        studyId: number
    ): Promise<ApiResponse<DicomUploadResult[]>> => {

        const formData = new FormData();

        files.forEach((f) => formData.append("files", f));

        formData.append("patientId", String(patientId));
        formData.append("studyId", String(studyId));

        const res = await apiClient.post<ApiResponse<DicomUploadResult[]>>(
            "/api/dicom/upload/batch",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return res.data;
    },

    // =========================
    // Study 조회
    // =========================
    getByStudy: async (
        studyUid: string
    ): Promise<ApiResponse<DicomFileResponse[]>> => {
        const res = await apiClient.get<ApiResponse<DicomFileResponse[]>>(
            `/api/dicom/study/${studyUid}`
        );

        return res.data;
    },

    // =========================
    // SOP UID 조회
    // =========================
    getByUid: async (
        sopInstanceUid: string
    ): Promise<ApiResponse<DicomFileResponse>> => {
        const res = await apiClient.get<ApiResponse<DicomFileResponse>>(
            `/api/dicom/uid/${sopInstanceUid}`
        );

        return res.data;
    },

    // =========================
    // 단건 조회
    // =========================
    get: async (
        id: number
    ): Promise<ApiResponse<DicomFileResponse>> => {
        const res = await apiClient.get<ApiResponse<DicomFileResponse>>(
            `/api/dicom/${id}`
        );

        return res.data;
    },
};