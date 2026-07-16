"use client";

import { useEffect,useState } from "react";

import { useParams } from "next/navigation";

import dynamic from "next/dynamic";

import { ViewerApi, ViewerResponse } from "@/services/viewer";
import {SeriesApi, SeriesResponse} from "@/services/series";
import {AiAnalysisApi, AiFindingDto, AiOverlayDto} from "@/services/AiAnalysis";
import {StudyApi, StudyResponse} from "@/services/study";

const DicomViewer = dynamic(

    ()=>import( "@/components/dicom/DicomViewer"), {

        ssr:false
    });

export default function ViewerPage(){

    const params = useParams();
    const studyInstanceUid = params.studyUid as string;
    const seriesInstanceUid = params.seriesUid as string;
    const [viewer, setViewer] = useState<ViewerResponse | null>(null);
    const [study, setStudy] = useState<StudyResponse | null>(null);
    const [loading,setLoading] = useState(true);
    const [findings, setFindings] = useState<AiFindingDto[]>([]);
    const [error,setError] = useState("");
    const [seriesList,setSeriesList] = useState<SeriesResponse[]>([]);
    const [overlays,setOverlays] = useState<AiOverlayDto[]>([]);

    useEffect(()=>{

        load();

    },[]);

    async function load(){

        try {

            const viewer = await ViewerApi.getViewer(
                studyInstanceUid,
                seriesInstanceUid
            );

            console.log("VIEWER RESPONSE", viewer);

            setViewer(viewer);

            const study = await StudyApi.getByUid(
                studyInstanceUid
            );

            console.log(study);

            setStudy(study);

            const series =
                await SeriesApi.getByStudyInstanceUid(
                    studyInstanceUid);

            setSeriesList(series.data);

            const overlayResponse =
                await AiAnalysisApi.getByStudyInstanceUid(
                    studyInstanceUid
                );

            console.log("OVERLAY RESPONSE", overlayResponse);

            setOverlays(overlayResponse);

            const analysisId =
                overlayResponse[0]?.analysisId;

            if(analysisId){

                const result =
                    await AiAnalysisApi.getResult(
                        analysisId
                    );

                console.log("AI RESULT >>>", result);

                console.log(
                    "FINDINGS >>>",
                    result.data.findings
                );

                setFindings(result.data.findings);
            }


        } catch {

            setError("DICOM 조회 실패");

        } finally {

            setLoading(false);
        }

    }

    if(loading){
        return(

            <div>
                Loading Viewer...
            </div>
        );
    }

    if(error){
        return(
            <div>
                {error}
            </div>
        );
    }

    if(!viewer){
        return(
            <div>
                Viewer 데이터 없음
            </div>
        );
    }



    return(

        <DicomViewer
            studyInstanceUid={viewer.studyInstanceUid}
            seriesInstanceUid={viewer.seriesInstanceUid}
            images={viewer.images}
            study={study}
            seriesList={seriesList}
            overlays={overlays}
            aiFindings={findings}
        />

    );

}