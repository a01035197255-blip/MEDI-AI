"use client";




import {Finding} from "@/services/AiAnalysis";

interface Props {

    findings: Finding[];

}


function getColor(risk:string){

    switch(risk){

        case "CRITICAL":
            return "255,0,0";

        case "HIGH":
            return "255,120,0";

        case "MEDIUM":
            return "255,220,0";

        default:
            return "0,255,0";
    }

}



export default function HeatmapOverlay({

                                           findings

                                       }:Props){


    return (

        <>

            {
                findings.map(f=>{

                    const color =
                        getColor(
                            f.riskLevel
                        );


                    return (

                        <div

                            key={f.id}

                            style={{

                                position:"absolute",

                                left:f.bboxX,
                                top:f.bboxY,

                                width:f.bboxW,
                                height:f.bboxH,

                                background:
                                    `rgba(${color},0.18)`,

                                boxShadow:
                                    `0 0 20px rgba(${color},0.4)`,

                                pointerEvents:"none",

                                zIndex:500

                            }}

                        />

                    );

                })
            }

        </>

    );

}