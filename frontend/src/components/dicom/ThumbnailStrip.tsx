"use client";

import React from "react";
import ThumbnailCanvas from "./ThumbnailCanvas";


interface Props {

    imageIds:string[];
    currentSlice:number;
    windowWidth:number;
    windowCenter:number;
    onSelect:(v:number)=>void;

}


export default function ThumbnailStrip({

                                           imageIds,
                                           currentSlice,
                                           windowWidth,
                                           windowCenter,
                                           onSelect

                                       }:Props){


    return (

        <div

            style={{

                height:90,
                display:"flex",
                gap:8,
                padding:8,
                background:"#111827",
                borderTop:"1px solid #263241",
                overflowX:"auto"

            }}

        >

            {
                imageIds.map((img,i)=>(

                    <div

                        key={i}
                        onClick={()=>onSelect(i)}
                        style={{
                            width:70,
                            height:70,
                            flex:"0 0 auto",
                            background:"#000",
                            border:
                                currentSlice===i
                                    ?
                                    "2px solid #2563eb"
                                    :
                                    "1px solid #374151",

                            cursor:"pointer",
                            position:"relative",
                            borderRadius:4,
                            overflow:"hidden"
                        }}

                    >

                        <ThumbnailCanvas

                            imageId={img}
                            index={i}
                            windowWidth={windowWidth}
                            windowCenter={windowCenter}

                        />


                        <span

                            style={{

                                position:"absolute",
                                bottom:2,
                                right:3,
                                fontSize:10,
                                color:"#fff",
                                background:"rgba(0,0,0,.6)"
                            }}

                        >

                            {i+1}

                        </span>

                    </div>
                ))
            }
        </div>
    );
}