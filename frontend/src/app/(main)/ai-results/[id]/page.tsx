"use client";

import {useEffect, useState} from "react";
import { useParams, useRouter } from "next/navigation";
import { AiAnalysisApi } from "@/services/AiAnalysis";
import { AiAnalysisResponse } from "@/services/AiAnalysis";

// --- 테마 색상 ---
const C = {
    bg: "#0B1120",

    surface: "#07182A",
    panel: "#0C1F34",
    card: "#0C1F34",

    border: "rgba(255,255,255,0.07)",
    borderLight: "rgba(59,130,246,0.18)",

    accent: "#3B82F6",
    accentDim: "rgba(59,130,246,0.12)",

    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444"
};

// --- 아이콘 ---
const Icons = {
    Back: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Alert: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};



export default function AiResultDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [analysis, setAnalysis] = useState<AiAnalysisResponse | null>(null);
    const id = params.id as string;

    const [activeTab, setActiveTab] = useState("분석 요약");
    const tabs = ["분석 요약"];

    useEffect(() => {
        const loadAnalysis = async () => {
            try {
                const response = await AiAnalysisApi.getResult(Number(id));

                if (response.success) {
                    setAnalysis(response.data);
                }
            } catch (e) {
                console.error("Analysis load error:", e);
            }
        };

        if (id) {
            loadAnalysis();
        }
    }, [id]);

    if(!analysis){

        return (
            <div style={{
                padding:"50px",
                color:C.text
            }}>
                AI 분석 결과 불러오는 중...
            </div>
        );

    }

    const overlay = analysis.overlays[0];
    const finding = analysis.findings[0];

    const riskScore =
        analysis.findings.length > 0
            ? Math.max(
                ...analysis.findings.map((f) => {
                    switch(f.riskLevel) {
                        case "CRITICAL": return 100;
                        case "HIGH": return 80;
                        case "MEDIUM": return 50;
                        case "LOW": return 20;
                        default: return 0;
                    }
                })
            )
            : 0;

    const riskColor =
        riskScore >= 80
            ? C.danger
            : riskScore >= 50
                ? C.warning
                : C.success;

    const lesionStatus =
        riskScore >= 80
            ? "이상 발견"
            : riskScore >= 50
                ? "의심"
                : "이상 없음";

    const lesionColor =
        riskScore >= 80
            ? C.danger
            : riskScore >= 50
                ? C.warning
                : C.success;
    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text, position: "relative" }}>

            {/* ── 1. 상단 타이틀 구역 ── */}
            <div>
                <button
                    onClick={() => router.back()}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: C.textFaint, cursor: "pointer", marginBottom: "16px", padding: 0, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.textFaint}
                >
                    <Icons.Back /> <span style={{ fontSize: "14px", fontWeight: 600 }}>목록으로 돌아가기</span>
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                            AN: {analysis.id}

                            <span style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: analysis.diagnosisResult === "ABNORMAL" ? C.danger : analysis.diagnosisResult === "SUSPICIOUS" ? C.warning : C.success,
                                background: analysis.diagnosisResult === "ABNORMAL" ? `${C.danger}1A` : analysis.diagnosisResult === "SUSPICIOUS" ? `${C.warning}1A` : `${C.success}1A`,
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: analysis.diagnosisResult === "ABNORMAL" ? `1px solid ${C.danger}40` : analysis.diagnosisResult === "SUSPICIOUS" ? `1px solid ${C.warning}40` : `1px solid ${C.success}40`
                            }}>
                                {analysis.diagnosisResult === "NORMAL" ? "정상" : analysis.diagnosisResult === "SUSPICIOUS" ? "의심" : "이상 발견"}
                            </span>
                        </h1>

                        <p style={{ color: C.textFaint, fontSize: "14px", margin: 0, fontWeight: 500 }}>
                            ST: {analysis.studyId} / {analysis.createdAt}
                        </p>
                    </div>

                    {/* 우측 뷰어 퀵 연동 버튼 */}
                    <button
                        onClick={() => router.push(`/viewer/${analysis.studyInstanceUid}/${analysis.seriesInstanceUid}`)}
                        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: C.accent, color: "#000", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                    >
                        DICOM Viewer 열기
                    </button>
                </div>
            </div>

            {/* ── 2. 탭 네비게이션 ── */}
            <div style={{ display: "flex", gap: "24px", borderBottom: `1px solid ${C.borderLight}` }}>
                {tabs.map(tab => (
                    <button
                        key={tab} onClick={() => setActiveTab(tab)}
                        style={{
                            background: "none", border: "none", padding: "12px 4px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                            color: activeTab === tab ? C.accent : C.textMuted,
                            borderBottom: activeTab === tab ? `2px solid ${C.accent}` : "2px solid transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── 3. 본문 컨텐츠 ── */}
            {activeTab === "분석 요약" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* 상단: 분석 정보 & 요약 (2분할 Grid) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                        {/* 3-1. 분석 정보 (Info) */}
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 20px 0", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: "12px" }}>분석 정보</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", fontSize: "14px" }}>
                                <div style={{ color: C.textFaint }}>분석 ID</div><div style={{ color: C.text, fontFamily: "monospace" }}>{analysis.id}</div>
                                <div style={{ color: C.textFaint }}>검사 ID</div><div style={{ color: C.text, fontFamily: "monospace" }}>{analysis.studyInstanceUid}</div>
                                <div style={{ color: C.textFaint }}>환자 정보</div><div style={{ color: C.text }}>{analysis.patientName} ({analysis.patientIdentifier})</div>
                                <div style={{ color: C.textFaint }}>AI 모델</div><div style={{ color: C.accent, fontWeight: 600 }}>{analysis.modelName}</div>
                                <div style={{ color: C.textFaint }}>분석 일시</div><div style={{ color: C.text }}>{analysis.createdAt}</div>
                                <div style={{ color: C.textFaint }}>평균 신뢰도</div><div style={{ color: C.text }}>{analysis.findings.length > 0 ? `${(analysis.findings.reduce((sum, f) => sum + f.confidence, 0) / analysis.findings.length * 100).toFixed(1)}%` : "-"}</div>
                            </div>
                        </div>

                        {/* 3-2. 분석 요약 (Summary & Score) */}
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", display: "flex", flexDirection: "column" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 20px 0", borderBottom: `1px solid ${C.borderLight}`, paddingBottom: "12px" }}>분석 요약</h2>

                            {/* 점수 게이지 바 */}
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", color: C.textFaint }}>AI 위험도 지수</span>
                                    <span style={{ fontSize: "24px", fontWeight: 700, color: riskColor }}> {riskScore}<span style={{ fontSize: "14px", color: C.textFaint }}>{" / 100"}</span></span>
                                </div>
                                <div style={{ width: "100%", height: "8px", background: C.panel, borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${riskScore}%`, height: "100%", background: riskColor, borderRadius: "4px" }} />
                                </div>
                            </div>

                            {/* 평가 항목 리스트 */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: C.panel, borderRadius: "6px" }}>
                                    <span style={{ fontSize: "13px", color: C.textMuted }}>구조물 평가 (Structural)</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.success, display: "flex", alignItems: "center", gap: "4px" }}><Icons.Check /> 정상</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "6px", border: `1px solid rgba(239, 68, 68, 0.2)` }}>
                                    <span style={{ fontSize: "13px", color: C.danger, fontWeight: 600 }}>병변 탐지 (Lesions)</span>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: C.danger, display: "flex", alignItems: "center", gap: "4px" }}>{riskScore >= 50 ? <Icons.Alert /> : <Icons.Check />}
                                        {lesionStatus}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 하단: 발견 목록 (Findings Table) */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px" }}>
                        <div style={{ padding: "20px", borderBottom: `1px solid ${C.borderLight}` }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>발견 목록 (Findings)</h2>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                                <thead>
                                <tr style={{ background: C.panel, color: C.textFaint, borderBottom: `1px solid ${C.border}` }}>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>No.</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>소견 (Finding)</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>설명 (description)</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>슬라이스</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>신뢰도</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600 }}>심각도</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analysis.findings.map((f, index) => (
                                    <tr key={index} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: "16px 20px", color: C.textMuted }}>{index + 1}</td>
                                        <td style={{ padding: "16px 20px", fontWeight: 600, color: C.text }}>{f.labelKo}</td>
                                        <td style={{ padding: "16px 20px", color: C.textMuted }}>{f.description}</td>
                                        <td style={{ padding: "16px 20px", color: C.textMuted }}> {f.sliceIndex} slice</td>
                                        <td style={{ padding: "16px 20px", color: C.text }}>{(f.confidence * 100).toFixed(1)}%</td>
                                        <td style={{ padding: "16px 20px" }}>
                                                <span style={{
                                                    padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
                                                    background: f.riskLevel === "CRITICAL" ? "rgba(239,68,68,0.1)" : "rgba(250,204,21,0.1)",
                                                    color: f.riskLevel === "CRITICAL" ? C.danger : C.warning
                                                }}>
                                                    {f.riskLevel}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}