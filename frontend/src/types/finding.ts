export type FindingSeverity =
    | "normal"
    | "low"
    | "medium"
    | "high"
    | "critical";


export interface AIFinding {

    id: string;
    label: string;
    confidence: number;
    severity: FindingSeverity;
    viewportId: string;
    sliceIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    model?: string;
    createdAt?: string;
}