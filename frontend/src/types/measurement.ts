export interface Measurement {

    id: number;

    type: "ROI" | "LENGTH" | "ANGLE";

    label: string;

    sliceIndex: number;

    mean?: number;

    min?: number;

    max?: number;

    std?: number;

    area?: number;

    width?: number;

    height?: number;

    length?: number;

    angle?: number;
}