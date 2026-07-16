"use client";






export async function uploadDicom(
    files:File[]
){


    const imageIds:string[] = [];



    for(const file of files){



        const res =
            await fetch(

                "/orthanc/instances",

                {

                    method:"POST",

                    body:file,

                    headers:{

                        "Content-Type":
                            "application/dicom"

                    }

                }

            );



        console.log(
            "ORTHANC STATUS",
            res.status
        );



        if(!res.ok){


            const text =
                await res.text();


            throw new Error(
                text
            );

        }



        const json =
            await res.json();



        console.log(
            "ORTHANC RESPONSE",
            json
        );



        const instanceId =
            json.ID;



        const imageId =

            `wadouri:/orthanc/instances/${instanceId}/file`;



        console.log(
            "CORNERSTONE IMAGE ID",
            imageId
        );



        imageIds.push(
            imageId
        );


    }



    return imageIds;


}