"use client";

import React, { useMemo, useState, useEffect } from "react";
import ViewerToolbar from "./ViewerToolbar";
import ViewportGrid from "./ViewportGrid";
import ViewerSlider from "./ViewerSlider";
import ThumbnailStrip from "./ThumbnailStrip";
import StudySidebar from "./StudySidebar";
import AIResultPanel from "./AiResultPanel";

import { ViewerImageDto } from "@/services/viewer";
import { ViewerTool, ViewerLayout, ViewportType } from "./dicom.types";
import { activateTool } from "./ViewerToolManager";
import { Measurement } from "@/types/measurement";
import MeasurementPanel from "./MeasurementPanel";
import ImageInfo from "./ImageInfo";
import { PatientInfo } from "@/types/dicom";
import PatientInfoBar from "./PatientInfoBar";
import {SeriesResponse} from "@/services/series";
import {AiAnalysisResponse, AiFindingDto, AiOverlayDto, Finding} from "@/services/AiAnalysis";
import {StudyResponse} from "@/services/study";



interface Props {
    studyInstanceUid: string;
    seriesInstanceUid: string;
    study: StudyResponse | null;
    images: ViewerImageDto[];
    seriesList:SeriesResponse[];
    aiResult?:AiAnalysisResponse;
    overlays: AiOverlayDto[];
    aiFindings: AiFindingDto[];
}

export default function DicomViewer({
                                        study,
                                        studyInstanceUid,
                                        seriesInstanceUid,
                                        images,
                                        seriesList,
                                        aiResult,
                                        overlays,
                                        aiFindings
                                    }: Props) {


    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const imageIds = useMemo(() => {

        return images.map(
            image =>
                `wadouri:${API_URL}${image.imageUrl}`
        );

    }, [images, API_URL]);



    const [slice, setSlice] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [ww, setWw] = useState(350);
    const [wc, setWc] = useState(40);
    const [tool, setTool] = useState<ViewerTool>("window");
    const [layout, setLayout] = useState<ViewerLayout>("1x1");
    const [cine, setCine] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [series,setSeries] = useState(seriesInstanceUid);
    const [selectedFindingId, setSelectedFindingId] = useState<number | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [modality, setModality] = useState<string>("UNKNOWN");
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        patientName: "",
        patientId: "",
        patientSex: "",
        patientAge: "",
        studyDate: "",
        modality: "",
        studyDescription: "",
        seriesDescription: "",
        bodyPart: "",
        imageCount: 0,
    });

    useEffect(() => {

        if (!study) return;

        setPatientInfo(prev => ({

            ...prev,

            patientName: study.patientName,
            patientId: study.patientIdentifier,
            patientSex: study.patientSex ?? "",
            patientAge: study.patientAge?.toString() ?? "",
            studyDate: study.studyDate,
            modality: study.modality,
            imageCount: images.length

        }));

    }, [study, images.length]);
    const autoViewportType: ViewportType = "STACK";

    useEffect(() => {

        console.log("OVERLAYS >>>", overlays);
        console.log("AI FINDINGS >>>", aiFindings);

        const result: Finding[] = overlays.map((overlay) => {

            const finding =
                aiFindings.find(
                    (item) =>
                        item.sliceIndex === overlay.sliceIndex
                );

            console.log("MATCH CHECK", {
                overlaySlice: overlay.sliceIndex,
                finding
            });

            return {
                id: overlay.id,

                // DICOM InstanceNumber가 1부터라면 -1
                sliceIndex: overlay.sliceIndex - 1,

                bboxX: overlay.bboxX,
                bboxY: overlay.bboxY,
                bboxW: overlay.bboxW,
                bboxH: overlay.bboxH,

                confidence: finding?.confidence ?? overlay.confidence,

                label: finding?.label ?? "Unknown",

                riskLevel: finding?.riskLevel ?? "LOW"
            };

        });

        setFindings(result);

    }, [overlays, aiFindings]);



    useEffect(()=>{

        if(!cine) return;

        const timer =
            setInterval(()=>{
                setSlice(prev=>{
                    if(prev >= imageIds.length-1){
                        setCine(false);
                        return prev;
                    }
                    return prev + 1;
                });
                },1500);
        return ()=>{
            clearInterval(timer);
        };

    },[
        cine,
        imageIds.length
    ]);

    const jumpToFinding =
        (finding: Finding)=>{

            setSelectedFindingId(finding.id);
            setSlice(finding.sliceIndex);

        };

    const studyList =
        useMemo(()=>{

            return seriesList.map((item,index)=>({

                id: item.seriesInstanceUid,

                name:
                    `${item.modality ?? ""} Series ${index + 1}`,

                modality:
                    item.modality ?? "",

                count:
                images.length

            }));

        },[
            seriesList,
            images.length
        ]);


    return (

        <div
            style={{
                width:"100%",
                height:"100vh",
                display:"flex",
                overflow:"hidden",
                background:"#020617",
                color:"#fff"
            }}
        >

            <StudySidebar
                series={seriesList}
                selected={series}
                imageCount={images.length}
                onSelect={(uid)=>{
                    setSeries(uid);
                }}
            />

            <div
                style={{
                    flex:1,
                    display:"flex",
                    flexDirection:"column",
                    minWidth:0
                }}
            >

                <PatientInfoBar
                    patientName={patientInfo.patientName}
                    patientId={patientInfo.patientId}
                    gender={patientInfo.patientSex}
                    age={Number(patientInfo.patientAge.replace(/\D/g, "")) || 0}
                    studyDate={patientInfo.studyDate}
                    modality={patientInfo.modality}
                    bodyPart={patientInfo.bodyPart || "-"}
                    seriesCount={seriesList.length}
                    imageCount={images.length}
                />

                <ViewerToolbar
                    zoom={zoom}
                    windowWidth={ww}
                    windowCenter={wc}
                    tool={tool}
                    layout={layout}
                    cine={cine}
                    onToolChange={(value)=>{
                        setTool(value);
                        activateTool(value);
                    }}
                    onZoomIn={()=> setZoom(v=>v+10)}
                    onZoomOut={()=> setZoom(v=>Math.max(10,v-10))}
                    onLayoutChange={setLayout}
                    onCine={()=> setCine(v=>!v)}
                    onFullscreen={()=> document.documentElement.requestFullscreen?.()}
                    onReset={()=>{
                        setSlice(0);
                        setZoom(100);
                        setWw(350);
                        setWc(40);
                        setTool("window");
                        setResetKey(v=>v+1);
                    }}
                />


                <ViewportGrid
                    layout={layout}
                    imageIds={imageIds}
                    slice={slice}
                    zoom={zoom}
                    ww={ww}
                    wc={wc}
                    activeTool={tool}
                    findings={findings}
                    selectedFindingId={selectedFindingId}
                    onSliceChange={setSlice}
                    onSelectFinding={jumpToFinding}
                    onMeasurementsChange={setMeasurements}
                    viewportType={autoViewportType}
                    onModalityDetected={setModality}
                    onPatientInfoLoaded={(info) => {

                        setPatientInfo(prev => ({

                            ...prev,

                            // DB 값 유지
                            patientName: prev.patientName,
                            patientId: prev.patientId,
                            patientSex: prev.patientSex,
                            patientAge: prev.patientAge,

                            // DICOM에서 갱신할 값
                            studyDate: prev.studyDate,
                            modality: prev.modality,
                            bodyPart: info.bodyPart,
                            studyDescription: prev.studyDescription,
                            seriesDescription: info.seriesDescription,
                            imageCount: info.imageCount

                        }));

                    }}
                    resetKey={resetKey}
                />

                <ViewerSlider

                    max={imageIds.length}
                    currentSlice={slice}
                    onSliceChange={setSlice}
                />

                <ThumbnailStrip
                    imageIds={imageIds}
                    currentSlice={slice}
                    onSelect={setSlice}
                    windowWidth={ww}
                    windowCenter={wc}
                />

            </div>

            <aside
                    style={{
                        width: 320,
                        display: "flex",
                        flexDirection: "column",
                        background: "#111827",
                        textAlign: "center",
                        borderLeft: "1px solid #1f2937",
                    }}
                >

                    <div
                        style={{
                            flexShrink: 0,
                            padding: 8,
                            borderBottom: "1px solid #374151",
                        }}
                    >
                        <ImageInfo
                            slice={slice}
                            total={imageIds.length}
                            zoom={zoom}
                            ww={ww}
                            wc={wc}
                            modality={modality}
                            series={autoViewportType}
                        />
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                        }}
                    >
                        <AIResultPanel
                            findings={findings}
                            onSelectFinding={jumpToFinding}
                        />

                        <MeasurementPanel
                            measurements={measurements}
                        />
                    </div>

                </aside>

        </div>
    );
}