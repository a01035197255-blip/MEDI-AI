"use client";

import { useEffect, useState } from "react";
import {StudyApi, StudyResponse} from "@/services/study";
import {AiAnalysisApi, AiAnalysisResponse} from "@/services/AiAnalysis";

const C = {
    bg: "#0B1120",

    surface: "#07182A",      // 상단 영역
    panel: "#0C1F34",        // 검색창, 패널
    card: "#0C1F34",         // 카드, 테이블

    border: "rgba(255,255,255,0.08)",
    borderLight: "rgba(59,130,246,0.18)",

    accent: "#3B82F6",
    accentDim: "rgba(59,130,246,0.12)",

    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
};

export default function StatisticsPage() {
    const [timeRange, setTimeRange] = useState("6MONTHS");

    const [studies, setStudies] = useState<StudyResponse[]>([]);
    const [analyses, setAnalyses] = useState<AiAnalysisResponse[]>([]);

    const abnormalCount =
        analyses.filter(
            a =>
                a.diagnosisResult==="ABNORMAL" ||
                a.diagnosisResult==="SUSPICIOUS"
        ).length;

    const waitingStudies = studies.filter(
        study =>
            !analyses.some(
                analysis =>
                    analysis.studyId === study.id
            )
    ).length;

    const abnormalRate =
        analyses.length===0
            ?0
            :Number(
                (abnormalCount / analyses.length *100)
                    .toFixed(1)
            );

    const STATS_CARDS = [
        {
            title:"누적 총 검사 수",
            value:`${studies.length} 건`,
            change:"",
            label:"등록된 검사",
            color:C.text
        },
        {
            title:"AI 이상 탐지율",
            value:`${abnormalRate}%`,
            change:"",
            label:"AI 분석 결과",
            color:C.danger
        },
        {
            title:"AI 분석 완료",
            value:`${analyses.length} 건`,
            change:"",
            label:"완료된 분석",
            color:C.accent
        },
        {
            title:"대기 중인 검사",
            value:`${waitingStudies} 건`,
            change:"",
            label:"분석 대기",
            color:C.warning
        }
    ];

    useEffect(() => {

        const loadStatistics = async () => {
            try {
                const studyRes = await StudyApi.getAll();
                const aiRes = await AiAnalysisApi.getAll();

                if(studyRes.success){
                    setStudies(studyRes.data);
                }

                if(aiRes.success){
                    setAnalyses(aiRes.data);
                }
            } catch(e){
                console.error(e);
            }
        };
        loadStatistics();
    },[]);

    const modalityMap:any = {};

    studies.forEach(study=>{

        const modality = study.modality || "UNKNOWN";

        modalityMap[modality] =
            (modalityMap[modality] || 0) + 1;

    });

    const totalStudies = studies.length;

    const MODALITY_DATA = Object.entries(modalityMap)
        .map(([name,count]:any)=>({name, count, ratio:
                totalStudies === 0
                    ? 0
                    : Number(((count / totalStudies)*100).toFixed(1)),
            color:
                name==="CT"
                    ? C.accent
                    : name==="MR" || name==="MRI"
                        ? C.success
                        : name==="CR" || name==="DX" || name==="XRAY"
                            ? C.warning
                            : C.textFaint
        }));

    const monthlyMap:any = {};

    studies.forEach(study => {

        if(!study.studyDate) return;

        const date = new Date(study.studyDate);

        const month = `${date.getMonth()+1}월`;

        monthlyMap[month] =
            (monthlyMap[month] || 0) + 1;

    });

    const MONTHLY_DATA = Object.entries(monthlyMap)
        .map(([month,count]:any)=>({
            month,
            count,
            abnormal: studies.filter(study=>{

                const date = new Date(study.studyDate);
                const studyMonth = `${date.getMonth()+1}월`;

                if(studyMonth !== month) return false;

                return analyses.some(
                    a =>
                        a.studyId === study.id &&
                        (
                            a.diagnosisResult === "ABNORMAL" ||
                            a.diagnosisResult === "SUSPICIOUS")
                );
            }).length
        }));

    // 차트 최대값 계산을 위한 기준 값
    const maxCount =
        MONTHLY_DATA.length > 0
            ? Math.max(...MONTHLY_DATA.map(d => d.count))
            : 1;

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text, fontFamily: "sans-serif" }}>

            {/* ── 1. 페이지 헤더 ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0" }}>통계 및 차트</h1>
                    <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>병원 내 PACS 검사 데이터와 AI 판독 통계를 시각화합니다.</p>
                </div>

            </div>

            {/* ── 2. 핵심 지표 카드 요약 (Grid) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {STATS_CARDS.map((card, i) => (
                    <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                        <div style={{ fontSize: "12px", color: C.textFaint, marginBottom: "12px", fontWeight: 500 }}>{card.title}</div>
                        <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: "11px", color: C.textMuted }}>
                            <span style={{ color: card.change.startsWith("+") ? C.danger : (card.change.startsWith("-") ? C.success : C.warning), fontWeight: 700, marginRight: "4px" }}>
                                {card.change}
                            </span>
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 3. 메인 시각화 데이터 영역 (2분할 레이아웃) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>

                {/* 좌측: 월별 검사 추이 (SVG 막대 그래프) */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0" }}>월별 검사 및 이상 탐지 추이</h2>
                        <p style={{ color: C.textFaint, fontSize: "12px", margin: 0 }}>전체 검사량 대비 AI가 이상 소견을 진단한 건수의 흐름입니다.</p>
                    </div>

                    {/* SVG 기반 바 차트 코어 구역 */}
                    <div style={{ flex: 1, minHeight: "260px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 10px 20px 10px", borderBottom: `1px solid ${C.borderLight}` }}>
                        {MONTHLY_DATA.map((d, idx) => {
                            const totalHeight = (d.count / maxCount) * 180; // 차트 최대 높이 제한
                            const abnormalHeight = (d.abnormal / maxCount) * 180;

                            return (
                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "12%" }}>

                                    {/* 이중 막대 컨테이너 */}
                                    <div style={{ width: "100%", height: "200px", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", gap: "4px" }}>
                                        {/* 총 검사수 바 */}
                                        <div style={{ width: "12px", height: `${totalHeight}px`, background: C.textMuted, borderTopLeftRadius: "3px", borderTopRightRadius: "3px", position: "relative" }} title={`총 검사: ${d.count}건`}>
                                            <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: C.textMuted, fontWeight: 600 }}>{d.count}</div>
                                        </div>
                                        {/* 이상 탐지수 바 */}
                                        <div style={{ width: "12px", height: `${abnormalHeight}px`, background: C.danger, borderTopLeftRadius: "3px", borderTopRightRadius: "3px", position: "relative" }} title={`이상 발견: ${d.abnormal}건`}>
                                            <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: C.danger, fontWeight: 600 }}>{d.abnormal}</div>
                                        </div>
                                    </div>

                                    {/* X축 라벨 */}
                                    <span style={{ fontSize: "12px", color: C.textMuted, fontWeight: 500 }}>{d.month}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 차트 가이드 범례(Legend) */}
                    <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "12px", justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "10px", height: "10px", background: C.panel, borderRadius: "2px" }} />
                            <span style={{ color: C.textMuted }}>전체 검사량</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "10px", height: "10px", background: C.danger, borderRadius: "2px" }} />
                            <span style={{ color: C.textMuted }}>AI 이상 판독 건수</span>
                        </div>
                    </div>
                </div>

                {/* 우측: 장비별(Modality) 분과 통계비율 */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0" }}>장비별 검사 분포 (Modality)</h2>
                        <p style={{ color: C.textFaint, fontSize: "12px", margin: 0 }}>PACS에 등록된 의료 장비별 비율 데이터입니다.</p>
                    </div>

                    {/* 가로형 진행 바 목록 시각화 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
                        {MODALITY_DATA.map((mod, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                    <span style={{ fontWeight: 600, color: C.textMuted }}>{mod.name}</span>
                                    <span style={{ fontWeight: 700, color: C.text }}>{mod.count}건 <span style={{ color: C.textFaint, fontWeight: 500, fontSize: "11px", marginLeft: "4px" }}>({mod.ratio}%)</span></span>
                                </div>

                                {/* 전체 트랙 */}
                                <div style={{ width: "100%", height: "6px", background: C.panel, borderRadius: "3px", overflow: "hidden" }}>
                                    {/* 채워지는 트랙 */}
                                    <div style={{ width: `${mod.ratio}%`, height: "100%", background: mod.color, borderRadius: "3px" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}