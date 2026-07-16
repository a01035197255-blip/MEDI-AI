"use client";

import React from "react";
import { SeriesResponse } from "@/services/series";


interface Props {

    series: SeriesResponse[];

    selected: string;

    onSelect: (seriesInstanceUid: string)=>void;

    imageCount: number;

}


export default function StudySidebar({

                                         series,
                                         selected,
                                         onSelect,
                                         imageCount

                                     }: Props){


    return (

        <aside
            style={{
                width:220,
                background:"#0f172a",
                borderRight:"1px solid #263241",
                padding:10,
                overflow:"auto"
            }}
        >

            <div
                style={{
                    fontSize:13,
                    fontWeight:700,
                    color:"#60a5fa",
                    marginBottom:12
                }}
            >
                SERIES
            </div>


            {
                series.map((s, index)=>(

                    <div

                        key={s.seriesInstanceUid}

                        onClick={()=>
                            onSelect(s.seriesInstanceUid)
                        }

                        style={{

                            padding:10,
                            marginBottom:8,
                            cursor:"pointer",
                            borderRadius:5,

                            background:
                                selected === s.seriesInstanceUid
                                    ? "#2563eb"
                                    : "#1f2937",

                            color:"#fff"

                        }}

                    >

                        <div
                            style={{
                                fontSize:12,
                                fontWeight:700
                            }}
                        >

                            {
                                `Series ${index + 1}`
                            }

                        </div>


                        <div
                            style={{
                                fontSize:11,
                                color:"#d1d5db",
                                marginTop:4
                            }}
                        >

                            {s.modality ?? ""}
                            {" · "}
                            {imageCount}

                        </div>


                    </div>

                ))

            }


        </aside>

    );

}