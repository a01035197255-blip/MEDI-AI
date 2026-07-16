"use client";

import { Measurement } from "@/types/measurement";

interface Props {
    measurements: Measurement[];
}

export default function MeasurementPanel({
                                             measurements,
                                         }: Props) {

    return (

        <div
            style={{
                marginTop: 12,
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: 12,
                color: "#fff"
            }}
        >

            <h3
                style={{
                    margin: 0,
                    marginBottom: 12,
                    fontSize: 15
                }}
            >
                Measurements
            </h3>


            {
                measurements.length === 0 && (

                    <div
                        style={{
                            color: "#94a3b8",
                            fontSize: 13
                        }}
                    >
                        No measurements
                    </div>

                )
            }


            {
                measurements.map((m) => (

                    <div
                        key={m.id}
                        style={{
                            marginBottom: 14,
                            paddingBottom: 10,
                            borderBottom:
                                "1px solid #1e293b"
                        }}
                    >

                        <b>{m.label}</b>


                        <div>
                            Slice : {m.sliceIndex + 1}
                        </div>


                        <div>
                            Width :
                            {(m.width ?? 0).toFixed(1)}
                            {" "}px
                        </div>


                        <div>
                            Height :
                            {(m.height ?? 0).toFixed(1)}
                            {" "}px
                        </div>


                        <div>
                            Area :
                            {(m.area ?? 0).toFixed(2)}
                            {" "}mm²
                        </div>


                        <div>
                            Mean HU :
                            {(m.mean ?? 0).toFixed(2)}
                        </div>


                        <div>
                            Min HU :
                            {(m.min ?? 0).toFixed(2)}
                        </div>


                        <div>
                            Max HU :
                            {(m.max ?? 0).toFixed(2)}
                        </div>


                        <div>
                            Std :
                            {(m.std ?? 0).toFixed(2)}
                        </div>


                    </div>

                ))
            }


        </div>

    );
}