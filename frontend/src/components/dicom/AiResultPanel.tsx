"use client";

import React from "react";
import { Finding } from "@/services/AiAnalysis";



interface Props {

    findings: Finding[];

    onSelectFinding?:(
        finding: Finding
    )=>void;

}


export default function AIResultPanel({

                                          findings,
                                          onSelectFinding

                                      }: Props) {


    return (

        <div
            style={{
                padding:12,
                color:"#fff"
            }}
        >

            <div
                style={{
                    marginBottom:12,
                    fontSize:14,
                    fontWeight:700,
                    color:"#22c55e"
                }}
            >
                AI ANALYSIS COMPLETE
            </div>


            <div
                style={{
                    fontSize:13,
                    fontWeight:700,
                    marginBottom:10,
                    color:"#94a3b8"
                }}
            >
                AI FINDINGS
            </div>



            {
                findings.length === 0 && (

                    <div
                        style={{
                            color:"#64748b",
                            fontSize:12
                        }}
                    >
                        No findings
                    </div>

                )
            }



            {
                findings.map((finding)=>(

                    <div

                        key={finding.id}

                        onClick={()=>{

                            onSelectFinding?.(
                                finding
                            );

                        }}

                        style={{
                            padding:"8px 10px",
                            marginBottom:6,
                            background:"#111827",
                            borderRadius:6,
                            cursor:"pointer",
                            border:"1px solid #1e293b"
                        }}

                    >

                        <div
                            style={{
                                fontSize:13,
                                color:"#f87171"
                            }}
                        >
                            ⚠ {finding.label}
                        </div>


                        <div
                            style={{
                                marginTop:4,
                                fontSize:12,
                                color:"#cbd5e1"
                            }}
                        >
                            {(finding.confidence * 100).toFixed(0)}%
                        </div>


                    </div>

                ))

            }


        </div>

    );

}