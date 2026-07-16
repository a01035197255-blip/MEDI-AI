    "use client";
    
    import React, { useEffect, useRef } from "react";
    import {RenderingEngine, Enums, StackViewport, VolumeViewport, metaData, volumeLoader, cache, eventTarget} from "@cornerstonejs/core";
    import {initTools, activateTool} from "./ViewerToolManager";
    import { ViewerTool, ViewerLayout } from "./dicom.types";
    import OverlayBox from "@/components/ai/OverlayBox";
    import { Measurement } from "@/types/measurement";
    import HeatmapOverlay from "@/components/ai/HeatmapOverlay";
    import { PatientInfo } from "@/types/dicom";

    import { Finding } from "@/services/AiAnalysis";

    interface Props {
        id: string;
        layout: ViewerLayout;
        viewportId:string;
        viewportType?:
            | "STACK"
            | "AXIAL"
            | "CORONAL"
            | "SAGITTAL";
        imageIds: string[];
        currentSlice: number;
        zoom: number;
        windowWidth: number;
        windowCenter: number;
        activeTool?: ViewerTool;
        findings?: Finding[];
        onSliceChange?: (v: number) => void;
        selectedFindingId?: number | null;
        onSelectFinding?: (finding: Finding) => void;
        onMeasurementsChange?: (list: Measurement[]) => void;
        onFindingJump?: (finding: Finding)=>void;
        onModalityDetected?: (value:string)=>void;
        onPatientInfoLoaded?: (info: PatientInfo) => void;
        resetKey:number;
    
    }

    export default function ViewerCanvas({
    
                                             id,
                                             viewportId,
                                             layout,
                                             viewportType="STACK",
                                             imageIds,
                                             currentSlice,
                                             zoom,
                                             windowWidth,
                                             windowCenter,
                                             activeTool,
                                             findings = [],
                                             onSliceChange,
                                             selectedFindingId = null,
                                             onSelectFinding,
                                             onMeasurementsChange,
                                             onFindingJump,
                                             onModalityDetected,
                                             onPatientInfoLoaded,
                                             resetKey,
    
                                             }: Props) {
    
    
        const renderingEngineRef = useRef<RenderingEngine | null>(null);
        const elementRef = useRef<HTMLDivElement>(null);
        const volumeId = `cornerstoneStreamingImageVolume:${id}`;
        const engineId = `dicom-render-engine-${id}`;
        const [drawing, setDrawing] = React.useState(false);
        const [startPoint, setStartPoint] = React.useState({
            x: 0,
            y: 0,
        });
        const [currentPoint, setCurrentPoint] = React.useState({
            x: 0,
            y: 0,
        });
    
        interface RoiAnnotation {
    
            id: number;
            type: "RECTANGLE";
            sliceIndex: number;
            x: number;
            y: number;
            width: number;
            height: number;
            createdAt: number;
            measurements: {
                mean: number;
                min: number;
                max: number;
                std: number;
                pixels: number;
                area: number;
            };
        }
    
        const [userRois, setUserRois] = React.useState<RoiAnnotation[]>([]);
        const [resizing, setResizing] = React.useState(false);
        const [resizeIndex, setResizeIndex] = React.useState<number | null>(null);
        const [resizeDirection, setResizeDirection] = React.useState<string | null>(null);
        const [resizeStart, setResizeStart] = React.useState({
            x: 0,
            y: 0
        });
        const [resizeOrigin, setResizeOrigin] = React.useState({
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
        const [selectedRoi, setSelectedRoi] = React.useState<number | null>(null);
        const [moving, setMoving] = React.useState(false);
        const [moveOffset, setMoveOffset] = React.useState({
            x: 0,
            y: 0
        });
        const [pixelSpacing, setPixelSpacing] = React.useState({
            x: 1,
            y: 1
        });
        const selectedRoiData = selectedRoi !== null
            ? userRois[selectedRoi]
            : null;



        function calculateROIStats(roiIndex: number) {
    
            const roi = userRois[roiIndex];
    
            if (!roi)
                return;

            const viewport =
                renderingEngineRef.current
                    ?.getViewport(viewportId);

            if (!viewport)
                return;

            if (viewport.type !== Enums.ViewportType.STACK)
                return;


            const stackViewport =
                viewport as StackViewport;

            const imageIndex =
                stackViewport.getCurrentImageIdIndex();

            const imageId =
                imageIds[imageIndex];

            if (!imageId)
                return;

            const imageData = stackViewport.getImageData();
    
            if (!imageData)
                return;
    
    
            const scalarData = imageData.scalarData;
            const dimensions = imageData.dimensions;
            const instance = metaData.get("instance", imageId);
            const spacing = metaData.get("imagePlaneModule", imageId)?.rowPixelSpacing;
    
            if (spacing) {
    
                setPixelSpacing({
    
                    x: Number(spacing[0] ?? 1),
                    y: Number(spacing[1] ?? 1)
    
                });
    
            }
            const startX =
                Math.max(
                    0,
                    Math.floor(roi.x)
                );
    
            const startY =
                Math.max(
                    0,
                    Math.floor(roi.y)
                );
    
            const endX =
                Math.min(
                    dimensions[0],
                    Math.ceil(roi.x + roi.width)
                );
    
            const endY =
                Math.min(
                    dimensions[1],
                    Math.ceil(roi.y + roi.height)
                );
    
            const values: number[] = [];
    
            for (
                let y = startY;
                y < endY;
                y++
            ) {
    
                for (
                    let x = startX;
                    x < endX;
                    x++
                ) {
    
                    const index = y * dimensions[0] + x;
                    const value = scalarData[index];
    
                    if (value !== undefined) {
                        values.push(
                            Number(value)
                        );
                    }
                }
            }
    
            if (values.length === 0)
                return;
    
            const slope =
                Number(
                    instance?.RescaleSlope ?? 1
                );
    
            const intercept =
                Number(
                    instance?.RescaleIntercept ?? 0
                );
    
            const huValues =
                values.map(
                    value =>
                        value * slope + intercept
                );
    
            const mean =
                huValues.reduce(
                    (a, b) => a + b,
                    0
                )
                /
                huValues.length;
    
            const min =
                Math.min(
                    ...huValues
                );
    
            const max =
                Math.max(
                    ...huValues
                );
    
            const variance =
                huValues.reduce(
                    (sum, value) =>
                        sum +
                        Math.pow(
                            value - mean,
                            2
                        ),
                    0
                )
                /
                huValues.length;
    
            setUserRois(prev =>
    
                prev.map((item, index) => {
    
                    if (index !== roiIndex)
                        return item;
    
                    return {
    
                        ...item,
    
                        measurements: {
    
                            ...item.measurements,
    
                            mean,
                            min,
                            max,
    
                            std:
                                Math.sqrt(
                                    variance
                                ),
    
                            pixels:
                            values.length,
    
                            area:
                                item.width *
                                pixelSpacing.x *
                                item.height *
                                pixelSpacing.y
                        }
                    };
                })
            );
        }
    
        useEffect(() => {
    
            if (selectedRoi === null)
                return;
    
            calculateROIStats(
                selectedRoi
            );
    
        }, [
            selectedRoi
        ]);
    
        useEffect(() => {
    
            const list: Measurement[] = userRois.map(roi => ({
    
                id: roi.id,
                type: "ROI",
                label: `ROI ${roi.id}`,
                sliceIndex: roi.sliceIndex,
                mean: roi.measurements.mean,
                min: roi.measurements.min,
                max: roi.measurements.max,
                std: roi.measurements.std,
                area: roi.measurements.area,
                width: roi.width,
                height: roi.height
    
            }));
    
            onMeasurementsChange?.(list);
    
        }, [userRois, onMeasurementsChange]);
    
        useEffect(() => {
    
            function handleMove(e: MouseEvent) {
    
                const rect =
                    elementRef.current?.getBoundingClientRect();
    
                if (!rect)
                    return;
    
                if (!moving)
                    return;
    
                if (selectedRoi === null)
                    return;
    
                setUserRois(prev =>
    
                    prev.map((roi, index) => {
    
                        if (index !== selectedRoi)
                            return roi;
    
                        return {
    
                            ...roi,
    
                            x: e.clientX - rect.left - moveOffset.x,
                            y: e.clientY - rect.top - moveOffset.y,
    
                            measurements: {
                                ...roi.measurements,
                                mean: 0,
                                min: 0,
                                max: 0,
                                std: 0,
                                pixels: 0
                            }
    
                        };
                    })
                );
            }
    
            function handleUp() {
    
                setMoving(false);
            }
    
            window.addEventListener("mousemove", handleMove);
            window.addEventListener("mouseup", handleUp);
    
            return () => {
    
                window.removeEventListener(
                    "mousemove",
                    handleMove
                );
    
                window.removeEventListener(
                    "mouseup",
                    handleUp
                );
    
            };
    
        }, [moving, selectedRoi, moveOffset]);
    
        useEffect(() => {
    
            if (moving)
                return;
    
            if (selectedRoi === null)
                return;
    
    
            const timer = setTimeout(() => {
    
                calculateROIStats(selectedRoi);
    
            }, 100);
    
    
            return () => {
    
                clearTimeout(timer);
    
            };
    
    
        }, [
            moving
        ]);
    
        useEffect(() => {
    
            function handleResizeMove(
                e: MouseEvent
            ) {
    
                if (!resizing)
                    return;
                if (resizeIndex === null)
                    return;
    
                setUserRois(prev =>
    
                    prev.map((roi, index) => {
    
                        if (index !== resizeIndex) return roi;
    
                        let width = resizeOrigin.width;
                        let height = resizeOrigin.height;
    
                        let x = resizeOrigin.x;
    
                        let y = resizeOrigin.y;
    
                        const dx = e.clientX - resizeStart.x;
    
                        const dy = e.clientY - resizeStart.y;
                        if (
                            resizeDirection?.includes("r")
                        ) {
                            width += dx;
                        }
    
                        if (
                            resizeDirection?.includes("b")
                        ) {
                            height += dy;
                        }
    
                        if (
                            resizeDirection?.includes("l")
                        ) {
                            x += dx;
                            width -= dx;
                        }
    
                        if (
                            resizeDirection?.includes("t")
                        ) {
                            y += dy;
                            height -= dy;
                        }
    
                        return {
    
                            ...roi,
    
                            x: Math.max(0, x),
                            y: Math.max(0, y),
                            width: Math.max(width, 20),
                            height: Math.max(height, 20),
    
                            measurements: {
                                ...roi.measurements,
                                mean: 0,
                                min: 0,
                                max: 0,
                                std: 0,
                                pixels: 0
                            }
    
                        };
                    })
                );
            }
    
            function handleResizeUp() {
    
                setResizing(false);
    
                setTimeout(() => {
    
                    setResizeIndex(null);
    
                }, 300);
    
            }
    
            window.addEventListener(
                "mousemove",
                handleResizeMove
            );
    
            window.addEventListener(
                "mouseup",
                handleResizeUp
            );
    
            return () => {
    
                window.removeEventListener(
                    "mousemove",
                    handleResizeMove
                );
    
                window.removeEventListener(
                    "mouseup",
                    handleResizeUp
                );
    
            };
    
        }, [
            resizing,
            resizeIndex,
            resizeDirection,
            resizeStart,
            resizeOrigin,
            selectedRoi
        ]);
    
        useEffect(() => {
    
            if (resizing)
                return;
    
            if (resizeIndex === null)
                return;
    
    
            const timer = setTimeout(() => {
    
                calculateROIStats(resizeIndex);
    
            }, 100);
    
    
            return () => {
    
                clearTimeout(timer);
    
            };
    
        }, [
            resizing
        ]);
    
        useEffect(() => {
    
            function handleKeyDown(e: KeyboardEvent) {
    
                if (e.key !== "Delete")
                    return;
    
                if (selectedRoi === null)
                    return;
    
                const target =
                    userRois[selectedRoi];
    
                setUserRois(prev =>
                    prev.filter(
                        roi => roi.id !== target.id
                    )
                );
    
                setSelectedRoi(null);
    
            }
    
            window.addEventListener("keydown", handleKeyDown);
    
            return () => {
    
                window.removeEventListener(
                    "keydown",
                    handleKeyDown
                );
    
            };
    
        }, [selectedRoi]);

        async function createVolume() {

            try {

                let volume;

                const existingVolume =
                    cache.getVolume(volumeId);

                if (existingVolume) {
                    volume = existingVolume;
                } else {
                    volume =
                        await volumeLoader.createAndCacheVolume(
                            volumeId,
                            {
                                imageIds
                            }
                        );
                }

                if (!volume) {
                    console.error("Volume not created");
                    return null;
                }

                return volume;

            } catch (error) {

                console.error(
                    "Volume creation failed",
                    error
                );

                return null;
            }
        }
    
        useEffect(() => {
    
            if (!imageIds.length)
                return;
    
            const element = elementRef.current;
    
            if (!element)
                return;
    
    
            let cancelled = false;
    
    
            async function setup() {

                const element = elementRef.current;

                if (!element)
                    return;

                if (!renderingEngineRef.current) {
                    renderingEngineRef.current =
                        new RenderingEngine(engineId);
                }

                const engine = renderingEngineRef.current;

                renderingEngineRef.current = engine;

                let cornerstoneViewportType;

                switch (viewportType) {
                    case "AXIAL":
                    case "CORONAL":
                    case "SAGITTAL":
                        cornerstoneViewportType = Enums.ViewportType.ORTHOGRAPHIC;
                        break;
                    default:
                        cornerstoneViewportType = Enums.ViewportType.STACK;
                        break;
                }

                let viewport =
                    engine.getViewport(viewportId);

                if(!viewport){

                    engine.enableElement({
                        viewportId,
                        type: cornerstoneViewportType,
                        element
                    });

                    viewport = engine.getViewport(viewportId);
                }

                if (!viewport) return;

                engine.resize(true);
    
                if (viewportType === "STACK") {

                    const stackViewport = viewport as StackViewport;

                    await stackViewport.setStack(imageIds);

                    if(cancelled)
                        return;

                    const latestViewport = engine.getViewport(viewportId) as StackViewport;

                    if(!latestViewport)
                        return;

                    await latestViewport.setImageIdIndex(0);
    
                    const patient =
                        metaData.get(
                            "patientModule",
                            imageIds[0]
                        );
    
                    const study =
                        metaData.get(
                            "generalStudyModule",
                            imageIds[0]
                        );
    
                    const series =
                        metaData.get(
                            "generalSeriesModule",
                            imageIds[0]
                        );

                    console.log("PATIENT", patient);
                    console.log("PATIENT NAME", patient?.patientName);
                    console.log("STUDY", study);
                    console.log("SERIES", series);
                    console.log("BODY PART", series?.bodyPartExamined);

                    onPatientInfoLoaded?.({

                        // ❌ DICOM에서 읽지 않음
                        patientName: "",
                        patientId: "",
                        patientSex: "",
                        patientAge: "",

                        // ✅ DICOM에서 가져와도 되는 정보
                        studyDate:
                            study?.studyDate ?? "",

                        modality:
                            series?.modality ?? "",

                        studyDescription:
                            study?.studyDescription ?? "",

                        seriesDescription:
                            series?.seriesDescription ?? "",

                        bodyPart:
                            series?.bodyPartExamined ?? "",

                        imageCount:
                        imageIds.length

                    });
    
                    if (series?.modality) {
    
                        onModalityDetected?.(
                            series.modality
                        );
    
                    }
    
                    if (cancelled)
                        return;
    
                    await new Promise(resolve => setTimeout(resolve, 100));

                    setTimeout(()=>{

                        const latestViewport =
                             engine.getViewport(viewportId) as StackViewport;

                        if(!latestViewport)
                            return;

                        if(latestViewport){
                            latestViewport.resetCamera();
                            latestViewport.render();
                        }

                    },50);
                } else {

                    const volume =
                        await createVolume();


                    if (!volume)
                        return;

                    if (viewport.type !== Enums.ViewportType.ORTHOGRAPHIC) {

                        console.error(
                            "Not VolumeViewport",
                            viewport.type
                        );

                        return;
                    }


                    const volumeViewport =
                        viewport as VolumeViewport;


                    await volumeViewport.setVolumes([
                        {
                            volumeId
                        }
                    ]);


                    if (viewportType === "AXIAL") {

                        volumeViewport.setOrientation(
                            Enums.OrientationAxis.AXIAL
                        );

                    } else if (viewportType === "CORONAL") {

                        volumeViewport.setOrientation(
                            Enums.OrientationAxis.CORONAL
                        );

                    } else if (viewportType === "SAGITTAL") {

                        volumeViewport.setOrientation(
                            Enums.OrientationAxis.SAGITTAL
                        );

                    }

                    volumeViewport.resetCamera();
                    volumeViewport.render();

                }
            }
    
            setup();

            return () => {

                cancelled = true;

                if (viewportType !== "STACK") {

                    const volume = cache.getVolume(volumeId);

                    if (volume) {
                        cache.removeVolumeLoadObject(volumeId);
                    }

                }

            };

        },[
            id,
            viewportId,
            viewportType,
            imageIds
        ]);
    
        useEffect(() => {
    
            if (resetKey === 0)
                return;
    
            const viewport =
                renderingEngineRef.current
                    ?.getViewport(viewportId);
    
            if (!viewport)
                return;
    
            viewport.resetCamera();
            viewport.setZoom(1);
            viewport.render();
    
    
        }, [resetKey, viewportId]);
    
        useEffect(() => {
    
            const engine = renderingEngineRef.current;
    
            if (!engine)
                return;
    
            const viewport = engine.getViewport(viewportId);
    
            if (!viewport)
                return;
    
            const voiRange = {
    
                lower: windowCenter - windowWidth / 2,
                upper: windowCenter + windowWidth / 2
            };
    
            try {
    
                if (
                    viewport.type === Enums.ViewportType.STACK
                ) {
    
                    const stackViewport = viewport as StackViewport;
    
                    stackViewport.setProperties({
    
                        voiRange
                    });
    
                    stackViewport.render();
    
                } else if (
    
                    viewport.type === Enums.ViewportType.ORTHOGRAPHIC
                ) {
    
                    const volumeViewport = viewport as VolumeViewport;


                    volumeViewport.setProperties({voiRange});
                    volumeViewport.render();
                }
            } catch (error) {
    
                console.warn(
                    "VOI update failed",
                    error
                );
            }
    
        }, [
            id,
            windowWidth,
            windowCenter
        ]);
    
        useEffect(() => {
    
            async function updateSlice() {
    
                const viewport =
                    renderingEngineRef.current
                        ?.getViewport(viewportId);
    
                if (!viewport)
                    return;
    
                if (
                    viewport.type !== Enums.ViewportType.STACK
                )
                    return;
    
                const stackViewport =
                    viewport as StackViewport;
    
                try {
    
                    stackViewport.setImageIdIndex(currentSlice);
    
                    stackViewport.render();
    
                } catch (error) {
    
                    console.error(
                        "slice update error",
                        error
                    );
                }
            }
    
            updateSlice();
    
        }, [
            currentSlice,
            viewportId
        ]);
    

    
        useEffect(() => {
    
            if (selectedRoi === null)
                return;
    
            const roi = userRois[selectedRoi];
    
            if (!roi)
                return;
    
            if (roi.sliceIndex !== currentSlice) {
    
                setSelectedRoi(null);
            }
    
        }, [
            currentSlice,
            selectedRoi,
            userRois
        ]);

        useEffect(() => {

            const engine = renderingEngineRef.current;

            if (!engine) return;

            const viewport = engine.getViewport(viewportId);

            if(!viewport) return;


            try {
                viewport.setZoom(zoom / 100);
                viewport.render();

            } catch(e){
                console.warn("zoom viewport destroyed", e);
            }
        }, [zoom, viewportId]);

        useEffect(() => {

            const engine = renderingEngineRef.current;

            if (!engine)
                return;

            const timer = setTimeout(() => {

                try {

                    engine.resize(true, true);

                    const viewport =
                        engine.getViewport(viewportId);

                    viewport?.render();

                } catch(error) {

                    console.warn(
                        "viewport resize failed",
                        error
                    );

                }

            }, 100);


            return () => {
                clearTimeout(timer);
            };

        }, [id, layout]);
    
        useEffect(() => {
    
            const engine = renderingEngineRef.current;
    
            if (!engine)
                return;
    
            if (!activeTool)
                return;
    
            const viewport = engine.getViewport(viewportId) as StackViewport;
    
            if (!viewport)
                return;
    
            activateTool(activeTool);
    
            viewport.render();
    
        }, [activeTool, viewportId]);
    
        useEffect(() => {
    
            if (!renderingEngineRef.current)
                return;
    
    
            const viewport =
                renderingEngineRef.current.getViewport(viewportId);
    
    
            if (!viewport)
                return;
    
    
            const target =
                findings.find(
                    f => f.id === selectedFindingId
                );
    
    
            if (!target)
                return;
    
    
            onSliceChange?.(target.sliceIndex);
    
    
            if (
                viewport.type === Enums.ViewportType.STACK
            ) {
    
                const stackViewport =
                    viewport as StackViewport;
    
    
                stackViewport.setImageIdIndex(
                    target.sliceIndex
                );
    
    
                stackViewport.setZoom(2.3);
    
            }
    
    
            viewport.render();
    
    
            onFindingJump?.(target);
    
    
        }, [
            selectedFindingId,
            viewportId
        ]);

        function convertFindingBox(finding: Finding) {

            const viewport =
                renderingEngineRef.current
                    ?.getViewport(viewportId) as StackViewport;


            if (!viewport)
                return {
                    x:finding.bboxX,
                    y:finding.bboxY,
                    width:finding.bboxW,
                    height:finding.bboxH
                };


            const canvas =
                elementRef.current
                    ?.querySelector("canvas");


            const imageData =
                viewport.getImageData();


            if(!canvas || !imageData)
                return {
                    x:finding.bboxX,
                    y:finding.bboxY,
                    width:finding.bboxW,
                    height:finding.bboxH
                };


            const dimensions =
                imageData.dimensions;


            const scale =
                Math.min(
                    canvas.width / dimensions[0],
                    canvas.height / dimensions[1]
                );


            const offsetX =
                (canvas.width - dimensions[0] * scale) / 2;


            const offsetY =
                (canvas.height - dimensions[1] * scale) / 2;


            return {

                x:
                    finding.bboxX * scale + offsetX,

                y:
                    finding.bboxY * scale + offsetY,

                width:
                    finding.bboxW * scale,

                height:
                    finding.bboxH * scale
            };
        }
    
        const isActive = findings.some(
            f => f.sliceIndex === currentSlice
        );
    
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    background: "#000"
                }}
            >
    
                {/* Cornerstone Canvas */}
                <div
                    ref={elementRef}
                    tabIndex={0}

                    onMouseDown={(e)=>{

                        if(activeTool !== "roi")
                            return;

                        const rect =
                            elementRef.current
                                ?.getBoundingClientRect();

                        if(!rect)
                            return;

                        setDrawing(true);

                        setStartPoint({
                            x:e.clientX - rect.left,
                            y:e.clientY - rect.top
                        });

                        setCurrentPoint({
                            x:e.clientX - rect.left,
                            y:e.clientY - rect.top
                        });

                    }}

                    onMouseMove={(e)=>{

                        if(!drawing)
                            return;


                        const rect =
                            elementRef.current
                                ?.getBoundingClientRect();

                        if(!rect)
                            return;

                        setCurrentPoint({

                            x:e.clientX - rect.left,

                            y:e.clientY - rect.top

                        });

                    }}

                    onMouseUp={()=>{

                        if(!drawing)
                            return;


                        const x =
                            Math.min(
                                startPoint.x,
                                currentPoint.x
                            );

                        const y =
                            Math.min(
                                startPoint.y,
                                currentPoint.y
                            );


                        const width =
                            Math.abs(
                                currentPoint.x -
                                startPoint.x
                            );


                        const height =
                            Math.abs(
                                currentPoint.y -
                                startPoint.y
                            );


                        if(width > 10 && height > 10){

                            setUserRois(prev=>[

                                ...prev,

                                {

                                    id:Date.now(),

                                    type:"RECTANGLE",

                                    sliceIndex:currentSlice,

                                    x,

                                    y,

                                    width,

                                    height,

                                    createdAt:Date.now(),

                                    measurements:{
                                        mean:0,
                                        min:0,
                                        max:0,
                                        std:0,
                                        pixels:0,
                                        area:0
                                    }

                                }

                            ]);

                        }

                        setDrawing(false);

                    }}

                    style={{
                        width:"100%",
                        height:"100%"
                    }}
                />
    
                {/* IMAGE INFO 우측 상단 */}
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2000,
                        width: 220,
                        opacity: 0.9
                    }}
                >
    
                </div>
    
    
                {/* VIEWPORT ID */}
                <div
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 100,
                        fontSize: 11,
                        color: "#60a5fa",
                        background: "rgba(0,0,0,.5)",
                        padding: "3px 6px"
                    }}
                >
                    {`Slice ${currentSlice + 1}/${imageIds.length}`}
                </div>

                {drawing && (

                    <div
                        style={{

                            position:"absolute",

                            left:
                                Math.min(
                                    startPoint.x,
                                    currentPoint.x
                                ),

                            top:
                                Math.min(
                                    startPoint.y,
                                    currentPoint.y
                                ),

                            width:
                                Math.abs(
                                    currentPoint.x -
                                    startPoint.x
                                ),

                            height:
                                Math.abs(
                                    currentPoint.y -
                                    startPoint.y
                                ),

                            border:"2px dashed #22c55e",

                            background:
                                "rgba(34,197,94,0.15)",

                            pointerEvents:"none",

                            zIndex:600

                        }}
                    />

                )}
    
                {/* 기존 ROI */}
                {userRois
                    .filter(
                        roi =>
                            roi.sliceIndex === currentSlice
                    )
                    .map((roi, index) => (

                        <OverlayBox

                            key={roi.id}

                            mode="ROI"

                            x={roi.x}
                            y={roi.y}

                            width={roi.width}
                            height={roi.height}

                            confidence={100}

                            label={`ROI ${index + 1}`}

                            risk="LOW"

                            active={
                                selectedRoi === index
                            }

                            onMouseDown={(e)=>{

                                e.stopPropagation();

                                setSelectedRoi(index);

                            }}

                            onResizeStart={(e,direction)=>{

                                e.stopPropagation();

                                setResizing(true);

                                setResizeIndex(index);

                                setResizeDirection(direction);

                                setResizeStart({
                                    x:e.clientX,
                                    y:e.clientY
                                });

                                setResizeOrigin({
                                    x:roi.x,
                                    y:roi.y,
                                    width:roi.width,
                                    height:roi.height
                                });

                            }}

                        />
    
                    ))
                }
    
    
                {/* AI HEATMAP */}
                <HeatmapOverlay
    
                    findings={
                        findings.filter(
                            f =>
                                f.sliceIndex === currentSlice
                        )
                    }
    
                />
    
    
                {/* AI BOX */}
                {
                    findings
                        .filter(
                            f =>
                                f.sliceIndex === currentSlice
                        )
                        .map(finding => {
    
                            const box =
                                convertFindingBox(finding);
    
    
                            return (
    
                                <OverlayBox
    
                                    key={finding.id}
    
                                    mode="AI"
    
                                    x={box.x}
                                    y={box.y}
    
                                    width={box.width}
                                    height={box.height}
    
                                    confidence={
                                        finding.confidence
                                    }
    
                                    label={
                                        finding.label
                                    }
    
                                    risk={
                                        finding.riskLevel
                                    }
    
                                    active={
                                        finding.id === selectedFindingId
                                    }
    
                                    onMouseDown={(e) => {
    
                                        e.stopPropagation();
    
                                        onSelectFinding?.(
                                            finding
                                        );
    
                                    }}
    
                                />
    
                            );
    
                        })
                }
    
    
            </div>
        );
    
    }
    
