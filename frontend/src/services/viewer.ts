import { apiClient } from "./apiClient";


export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

// Overlay
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
    sopInstanceUid: string;
}

// Image
export interface ViewerImageDto {

    imageId: number;

    instanceNumber: number;
    sopInstanceUid: string;

    imageUrl: string;

    rows: number;

    columns: number;

    overlays: AiOverlayDto[];
}

// Viewer Response
export interface ViewerResponse {

    studyInstanceUid: string;

    seriesInstanceUid: string;

    images: ViewerImageDto[];
}

export const ViewerApi = {

    // Viewer 데이터 조회
    getViewer: async (
        studyInstanceUid: string,
        seriesInstanceUid: string
    ): Promise<ViewerResponse> => {

        const response =
            await apiClient.get<
                ApiResponse<ViewerResponse>
            >(
                `/api/viewer/${studyInstanceUid}/${seriesInstanceUid}`
            );
        return response.data.data;
    }
};