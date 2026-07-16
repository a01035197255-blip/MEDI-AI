"use client";

import React from "react";

import {
    ViewerTool,
    ViewerLayout
} from "./dicom.types";


interface Props{

    zoom:number;
    windowWidth:number;
    windowCenter:number;
    tool:ViewerTool;
    layout:ViewerLayout;
    cine:boolean;
    onToolChange: (v:ViewerTool)=>void;
    onZoomIn:()=>void;
    onZoomOut:()=>void;
    onLayoutChange: (v:ViewerLayout)=>void;
    onCine:()=>void;
    onFullscreen:()=>void;
    onReset:()=>void;

}



const tools:
    {
        id:ViewerTool;
        label:string;
    }[]=[

    {
        id:"window",
        label:"W/L"
    },

    {
        id:"pan",
        label:"PAN"
    },

    {
        id:"zoom",
        label:"ZOOM"
    },

    {
        id:"scroll",
        label:"SCROLL"
    },

    {
        id:"length",
        label:"LEN"
    },

    {
        id:"angle",
        label:"ANGLE"
    },

    {
        id:"roi",
        label:"ROI"
    }

];



export default function ViewerToolbar({

                                          zoom,
                                          tool,
                                          layout,
                                          cine,
                                          onToolChange,
                                          onZoomIn,
                                          onZoomOut,
                                          onLayoutChange,
                                          onCine,
                                          onFullscreen,
                                          onReset

                                      }:Props){


    return(

        <div

            style={{

                height:48,
                display:"flex",
                alignItems:"center",
                gap:6,
                padding:"0 10px",
                background:"#111827",
                borderBottom:
                    "1px solid #263241"

            }}

        >

            {
                tools.map(t=>(

                    <button

                        key={t.id}

                        onClick={() => {
                            console.log(t.id);
                            onToolChange(t.id);
                        }}

                        style={{

                            height:30,
                            padding:"0 10px",
                            border:"none",
                            borderRadius:4,
                            cursor:"pointer",
                            fontSize:11,
                            fontWeight:700,
                            color:"#fff",
                            background:

                                tool===t.id

                                    ?"#2563eb"

                                    :"#374151"
                        }}

                    >

                        {t.label}

                    </button>

                ))
            }


            <div
                style={{
                    width:1,
                    height:25,
                    background:"#374151",
                    margin:"0 5px"
                }}
            />



            <button
                onClick={onZoomOut}
            >
                -
            </button>


            <span style={{
                fontSize:12,
                width:45,
                textAlign:"center"
            }}>
    {zoom}%
</span>

            <button
                onClick={onZoomIn}
            >
                +
            </button>

            <select

                value={layout}

                onChange={(e)=>
                    onLayoutChange(
                        e.target.value as ViewerLayout
                    )
                }

                style={{
                    height:30,
                    padding:"0 8px",
                    border:"none",
                    borderRadius:4,
                    cursor:"pointer",
                    fontSize:12,
                    fontWeight:700,
                    color:"#fff",
                    background:"#374151"
                }}

            >

                <option value="1x1">
                    1x1
                </option>

                <option value="2x2">
                    2x2
                </option>

                <option value="3x3">
                    3x3
                </option>

            </select>


            <button
                onClick={onCine}
            >

                {cine
                    ?"STOP"
                    :"CINE"}

            </button>

            <button
                onClick={onFullscreen}
            >
                FULL
            </button>

            <button
                onClick={onReset}
            >
                RESET
            </button>

        </div>

    );

}