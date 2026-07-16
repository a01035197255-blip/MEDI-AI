"use client";

import React, { useEffect, useRef } from "react";
import {
    RenderingEngine,
    Enums,
    StackViewport
} from "@cornerstonejs/core";


interface Props {
    imageId: string;
    index: number;
    windowWidth?: number;
    windowCenter?: number;
}


let thumbnailEngine: RenderingEngine | null = null;


export default function ThumbnailCanvas({
                                            imageId,
                                            index,
                                            windowWidth,
                                            windowCenter
                                        }: Props) {


    const elementRef = useRef<HTMLDivElement>(null);


    useEffect(()=>{


        const element = elementRef.current;

        if(!element)
            return;

        if(!imageId)
            return;


        if(!thumbnailEngine){

            thumbnailEngine =
                new RenderingEngine(
                    "thumbnail-engine"
                );

        }


        const viewportId =
            `thumbnail-${index}`;


        async function init(){


            let viewport =
                thumbnailEngine!.getViewport(
                    viewportId
                ) as StackViewport;



            if(!viewport){


                thumbnailEngine!.enableElement({

                    viewportId,

                    type: Enums.ViewportType.STACK,

                    element: elementRef.current!

                });


                viewport =
                    thumbnailEngine!.getViewport(
                        viewportId
                    ) as StackViewport;

            }



            await viewport.setStack(
                [imageId],
                0
            );


            viewport.render();

        }


        init();



        return ()=>{

            try{

                thumbnailEngine?.disableElement(
                    viewportId
                );

            }catch(e){

                console.warn(e);

            }

        };


    },[
        imageId,
        index
    ]);



    return (

        <div

            ref={elementRef}

            style={{
                width:"100%",
                height:"100%",
                background:"#000"
            }}

        />

    );

}