"use client";

import React from "react";
import ViewerCanvas from "./ViewerCanvas";
import {ViewerTool} from "./dicom.types";

import {ViewportType} from "./dicom.types";
import { Measurement } from "@/types/measurement";
import { PatientInfo } from "@/types/dicom";
import { ViewerLayout } from "./dicom.types";
import {Finding} from "@/services/AiAnalysis";

interface Props {

    id:string;
    index: number;
    viewportId:string;
    layout: ViewerLayout;
    viewportType:ViewportType;
    imageIds:string[];
    slice:number;
    zoom:number;
    ww:number;
    wc:number;
    activeTool:ViewerTool;
    findings:Finding[];
    selectedFindingId:number | null;
    onSelectFinding:(finding:Finding)=>void;
    onSliceChange:(v:number)=>void;
    onMeasurementsChange: (m: Measurement[]) => void;
    onFindingJump?: (finding: Finding)=>void;
    onModalityDetected?: (value:string)=>void;
    onPatientInfoLoaded?: (info: PatientInfo) => void;
    resetKey:number;
}

export default function ViewportCell({

                                         id,
                                         viewportId,
                                         layout,
                                         index,
                                         viewportType,
                                         imageIds,
                                         slice,
                                         zoom,
                                         ww,
                                         wc,
                                         activeTool,
                                         findings,
                                         selectedFindingId,
                                         onSelectFinding,
                                         onSliceChange,
                                         onMeasurementsChange,
                                         onFindingJump,
                                         onModalityDetected,
                                         onPatientInfoLoaded,
                                         resetKey,


                                     }:Props){

    return (

        <div

            style={{

                width:"100%",
                height:"100%",
                position:"relative",
                background:"#000",
                border:"1px solid #263241",
                overflow:"hidden",


            }}
        >

            <ViewerCanvas

                id={id}
                layout={layout}
                viewportId={viewportId}
                viewportType={viewportType}
                imageIds={imageIds}
                currentSlice={slice}
                zoom={zoom}
                windowWidth={ww}
                windowCenter={wc}
                activeTool={activeTool}
                findings={findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={onSelectFinding}
                onSliceChange={onSliceChange}
                onMeasurementsChange={onMeasurementsChange}
                onFindingJump={onFindingJump}
                onModalityDetected={onModalityDetected}
                onPatientInfoLoaded={onPatientInfoLoaded}
                resetKey={resetKey}
            />

            <div

                style={{

                    position:"absolute",
                    top:5,
                    right:5,
                    fontSize:11,
                    color:"#60a5fa",
                    background:"rgba(0,0,0,.5)",
                    padding:"3px 6px",
                    zIndex:20
                }}
            >

                {viewportType}-{index + 1}

            </div>

        </div>
    );
}