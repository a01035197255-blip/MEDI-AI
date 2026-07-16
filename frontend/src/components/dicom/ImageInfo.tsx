"use client";

interface Props {

    slice:number;
    total:number;
    zoom:number;
    ww:number;
    wc:number;
    modality?:string;
    series?:string;

}


export default function ImageInfo({

                                      slice,

                                      total,

                                      zoom,

                                      ww,

                                      wc,

                                      modality="CT",

                                      series="AXIAL"

                                  }:Props){


    return (

        <div

            style={{

                width:220,

                padding:16,

                background:"#111827",

                color:"#fff",

                borderLeft:"1px solid #334155",

                height:"100%",

                boxSizing:"border-box"

            }}

        >


            <h4

                style={{

                    margin:"0 0 16px 0",

                    fontSize:15,

                    color:"#60a5fa"

                }}

            >

                IMAGE INFO

            </h4>



            <Row

                label="Modality"

                value={modality}

            />


            <Row

                label="Series"

                value={series}

            />


            <Row

                label="Slice"

                value={`${slice + 1} / ${total}`}

            />


            <Row

                label="Zoom"

                value={`${zoom}%`}

            />


            <Row

                label="Window Width"

                value={ww}

            />


            <Row

                label="Window Center"

                value={wc}

            />


        </div>

    );

}



function Row({

                 label,

                 value

             }:{

    label:string;

    value:string|number;

}){


    return (

        <div

            style={{

                display:"flex",

                justifyContent:"space-between",

                alignItems:"center",

                marginBottom:10,

                fontSize:12

            }}

        >

            <span

                style={{

                    color:"#94a3b8"

                }}

            >

                {label}

            </span>


            <strong>

                {value}

            </strong>


        </div>

    );

}