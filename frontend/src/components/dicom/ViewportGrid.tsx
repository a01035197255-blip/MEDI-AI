"use client";

import React from "react";
import ViewportCell from "./ViewportCell";

import { Measurement } from "@/types/measurement";
import { ViewerLayout, ViewerTool, ViewportType } from "./dicom.types";
import { PatientInfo } from "@/types/dicom";
import {Finding} from "@/services/AiAnalysis";


interface Props {

    layout: ViewerLayout;
    imageIds: string[];
    slice: number;
    zoom: number;
    ww: number;
    wc: number;
    activeTool: ViewerTool;
    findings: Finding[];
    selectedFindingId: number | null;
    onSelectFinding: (finding: Finding) => void;
    onSliceChange: (v: number) => void;
    viewportType?: ViewportType;
    onMeasurementsChange: (value: Measurement[]) => void;
    onFindingJump?: (finding: Finding) => void;
    onModalityDetected?: (value:string)=>void;
    onPatientInfoLoaded?: (info: PatientInfo) => void;
    resetKey:number;

    }


export default function ViewportGrid({

                                         layout,
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
                                         viewportType = "STACK",
                                         onMeasurementsChange,
                                         onFindingJump,
                                         onModalityDetected,
                                         onPatientInfoLoaded,
                                         resetKey,

                                     }: Props) {


    React.useEffect(()=>{

        const timer = setTimeout(()=>{

            window.dispatchEvent(
                new Event("resize")
            );

        },300);


        return ()=>{

            clearTimeout(timer);

        };

    },[layout]);


    const layoutConfig = {

        "1x1":{
            count:1,
            column:1
        },

        "2x2":{
            count:4,
            column:2
        },

        "3x3":{
            count:9,
            column:3
        }

    }[layout];


    const [viewportStates,setViewportStates] =
        React.useState(

            () =>
                Array.from({
                    length:9
                }).map((_,index)=>({

                    id:index,
                    slice:0,
                    zoom,
                    ww,
                    wc
                }))
        );


    function getViewportType():ViewportType {

        return viewportType;

    }



    return (

        <div

            style={{

                flex:1,
                display:"grid",
                gridTemplateColumns: `repeat(${layoutConfig.column},1fr)`,
                gridTemplateRows: `repeat(${layoutConfig.column},1fr)`,
                background:"#020617"

            }}

        >

            {
                Array.from({

                    length:layoutConfig.count

                })
                    .map((_,i)=>{


                        const currentViewportType = getViewportType();
                        const viewportId = `${currentViewportType.toLowerCase()}-${i}`;
                        const state = viewportStates[i];

                        return (

                            <ViewportCell

                                key={viewportId}
                                layout={layout}
                                id={viewportId}
                                viewportId={viewportId}
                                viewportType={currentViewportType}
                                imageIds={imageIds}
                                slice={slice}
                                zoom={state.zoom}
                                ww={state.ww}
                                wc={state.wc}
                                activeTool={activeTool}
                                findings={findings}
                                selectedFindingId={selectedFindingId}
                                onSelectFinding={onSelectFinding}
                                onModalityDetected={onModalityDetected}
                                onPatientInfoLoaded={onPatientInfoLoaded}
                                resetKey={resetKey}
                                onSliceChange={(value)=>{


                                    setViewportStates(prev =>

                                        prev.map((item,index)=>{


                                            if(index !== i)

                                                return item;



                                            return {

                                                ...item,

                                                slice:value

                                            };


                                        })

                                    );


                                    onSliceChange(value);

                                }}


                                onMeasurementsChange={
                                    onMeasurementsChange
                                }


                                onFindingJump={
                                    onFindingJump
                                }

                            />

                        );

                    })
            }

        </div>

    );

}