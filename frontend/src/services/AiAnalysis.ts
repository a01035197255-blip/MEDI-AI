import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export enum AnalysisStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

export enum DiagnosisResult {
    NORMAL = "NORMAL",
    SUSPICIOUS = "SUSPICIOUS",
    ABNORMAL = "ABNORMAL",
}


// --- 분석 결과 DTO ---
export interface AiAnalysisResponse {
    id: number;
    studyId: number;
    patientId: number;
    studyInstanceUid: string;
    patientIdentifier: string;
    patientName: string;
    seriesInstanceUid: string;
    diagnosisResult: DiagnosisResult;
    overallImpression: string | null;
    modelName: string | null;
    modelVersion: string | null;
    processingTimeMs: number | null;
    status: AnalysisStatus;
    createdAt: string;
    findings: AiFindingDto[];
    overlays: AiOverlayDto[];
}

export interface AiFindingDto {
    sliceIndex: number;
    label: string;
    labelKo: string;
    description: string;
    confidence: number;
    riskLevel: RiskLevel;
}

export interface AiOverlayDto {
    id: number;
    sliceIndex: number;
    bboxX: number;
    bboxY: number;
    bboxW: number;
    bboxH: number;
    confidence: number;
    imageId: number;
    imageUrl: string;
    analysisId: number;
}
export interface Finding {
    id: number;

    // 어느 슬라이스에 표시할지
    sliceIndex: number;

    // Bounding Box 좌표
    bboxX: number;
    bboxY: number;
    bboxW: number;
    bboxH: number;

    // AI 신뢰도
    confidence: number;

    // AI 결과 정보
    label: string;

    // 위험도
    riskLevel:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL";
}

// --- 비교 및 부가 기능 DTO ---
export interface CompareAnalysisResponse {
    current: string;
    previous: string;
    change: string;
}

export interface SCResponse {
    scId: number;
    analysisId: number;
    imagePath: string;
    sliceIndex: number;
}

export const AiAnalysisApi = {

    requestAnalysis: async (
        studyInstanceUid: string,
        seriesInstanceUid: string
    ): Promise<ApiResponse<AiAnalysisResponse>> => {
        const res = await apiClient.post<ApiResponse<AiAnalysisResponse>>(
            `/api/analysis/study/${studyInstanceUid}/series/${seriesInstanceUid}`
        );
        return res.data;
    },

    getStatus: async (
        analysisId: number
    ): Promise<ApiResponse<AnalysisStatus>> => {
        const res = await apiClient.get<ApiResponse<AnalysisStatus>>(
            `/api/analysis/${analysisId}/status`
        );
        return res.data;
    },

    getByStudyInstanceUid: async (
        studyInstanceUid: string
    ): Promise<AiOverlayDto[]> => {

        const res = await apiClient.get<ApiResponse<AiOverlayDto[]>>(
            `/api/analysis/study/${studyInstanceUid}`
        );
        return res.data.data;
    },

    getResult: async (
        analysisId: number
    ): Promise<ApiResponse<AiAnalysisResponse>> => {
        const res = await apiClient.get<ApiResponse<AiAnalysisResponse>>(
            `/api/analysis/${analysisId}`
        );
        return res.data;
    },

    getAll: async (): Promise<ApiResponse<AiAnalysisResponse[]>> => {
        const res = await apiClient.get<ApiResponse<AiAnalysisResponse[]>>(
            "/api/analysis"
        );
        return res.data;
    },

    compare: async (
        currentId: number,
        previousId: number
    ): Promise<ApiResponse<CompareAnalysisResponse>> => {
        const res = await apiClient.get<ApiResponse<CompareAnalysisResponse>>(
            "/api/analysis/compare",
            {
                params: { currentId, previousId }
            }
        );
        return res.data;
    },

    getHistory: async (
        patientId: number
    ): Promise<ApiResponse<AiAnalysisResponse[]>> => {
        const res = await apiClient.get<ApiResponse<AiAnalysisResponse[]>>(
            `/api/analysis/patient/${patientId}/history`
        );
        return res.data;
    },

    generateSecondaryCapture: async (
        analysisId: number
    ): Promise<ApiResponse<SCResponse>> => {
        const res = await apiClient.post<ApiResponse<SCResponse>>(
            `/api/analysis/${analysisId}/secondary-capture`
        );
        return res.data;
    },

    listSecondaryCaptures: async (
        analysisId: number
    ): Promise<ApiResponse<SCResponse[]>> => {
        const res = await apiClient.get<ApiResponse<SCResponse[]>>(
            `/api/analysis/${analysisId}/secondary-captures`
        );
        return res.data;
    },

    getSecondaryCapture: async (
        scId: number
    ): Promise<ApiResponse<SCResponse>> => {
        const res = await apiClient.get<ApiResponse<SCResponse>>(
            `/api/analysis/secondary-capture/${scId}`
        );
        return res.data;
    }

};