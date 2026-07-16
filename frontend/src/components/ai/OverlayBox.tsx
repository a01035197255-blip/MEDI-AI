"use client";

interface Props {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    label: string;
    risk: string;
    active: boolean;
    mode?: "ROI" | "AI";

    onMouseDown?: (e: React.MouseEvent) => void;
    onResizeStart?: (e: React.MouseEvent, direction: string) => void;
}

function getColor(risk: string) {
    switch (risk) {
        case "CRITICAL":
            return "#ef4444";
        case "HIGH":
            return "#f97316";
        case "MEDIUM":
            return "#facc15";
        default:
            return "#22c55e";
    }
}

export default function OverlayBox({
                                       x,
                                       y,
                                       width,
                                       height,
                                       confidence,
                                       label,
                                       risk,
                                       active,
                                       onMouseDown,
                                       onResizeStart,
                                       mode="ROI",

                                   }: Props) {

    const color = getColor(risk);

    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                width,
                height,
                border: active
                    ? "3px solid #60a5fa"
                    : `2px solid ${color}`,
                boxSizing: "border-box",
                pointerEvents: "auto",
                zIndex: 500,
            }}
        >

            {/* 이동 영역 */}
            <div
                onMouseDown={
                    mode === "ROI"
                        ? onMouseDown
                        : undefined
                }
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "auto",
                    cursor: "move",
                }}
            />

            {/* 라벨 */}
            <div
                onMouseDown={
                    mode === "ROI"
                        ? onMouseDown
                        : undefined
                }
                style={{
                    position: "absolute",
                    top: -22,
                    left: 0,
                    background: color,
                    color: "#fff",
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                    pointerEvents: "auto",
                    cursor: "move",
                }}
            >
                {mode === "AI"
                    ? `${label} ${(confidence * 100).toFixed(1)}%`
                    : label
                }
            </div>

            {active && mode === "ROI" && (
                <>
                    <div
                        className="handle tl"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "tl");
                        }}
                    />

                    <div
                        className="handle tr"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "tr");
                        }}
                    />

                    <div
                        className="handle bl"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "bl");
                        }}
                    />

                    <div
                        className="handle br"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "br");
                        }}
                    />

                    <div
                        className="handle tm"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "t");
                        }}
                    />

                    <div
                        className="handle bm"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "b");
                        }}
                    />

                    <div
                        className="handle ml"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "l");
                        }}
                    />

                    <div
                        className="handle mr"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart?.(e, "r");
                        }}
                    />
                </>
            )}

            {/* Risk */}
            {
                mode === "AI" && (

                    <div
                        style={{
                            position:"absolute",
                            bottom:-20,
                            left:0,
                            color,
                            fontSize:10,
                            fontWeight:700,
                            pointerEvents:"none",
                        }}
                    >
                        {risk}
                    </div>

                )
            }

        </div>
    );
}