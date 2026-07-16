"use client";

import React from "react";


interface Props{

    max:number;

    currentSlice:number;

    onSliceChange:
        (v:number)=>void;

}



export default function ViewerSlider({

                                         max,
                                         currentSlice,
                                         onSliceChange

                                     }:Props){



    const safeMax =
        Number.isFinite(max)
            ? max
            : 0;


    const safeSlice =
        Number.isFinite(currentSlice)
            ? currentSlice
            : 0;



    return (

        <div

            style={{

                height:42,

                background:"#020617",

                borderTop:
                    "1px solid #263241",

                display:"flex",

                alignItems:"center",

                gap:12,

                padding:"0 14px",

                color:"#fff"

            }}

        >


            <span

                style={{

                    fontSize:12,

                    width:90,

                    color:"#9ca3af"

                }}

            >

                Slice {safeSlice+1}/{safeMax}

            </span>



            <input

                type="range"

                min={0}

                max={
                    Math.max(
                        safeMax-1,
                        0
                    )
                }

                value={safeSlice}


                onChange={(e)=>{

                    onSliceChange(
                        Number(
                            e.target.value
                        )
                    );

                }}


                style={{

                    flex:1

                }}

            />


        </div>

    );

}