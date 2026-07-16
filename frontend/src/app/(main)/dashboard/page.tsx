"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StudyApi } from "@/services/study";
import { AiAnalysisApi } from "@/services/AiAnalysis";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

import {
    Users,
    ScanLine,
    Brain,
    AlertTriangle
} from "lucide-react";
import {PatientApi} from "@/services/patient";

const C = {
    // Layout
    surface: "#07182A",      // Header, Sidebar
    panel: "#0C1F34",        // Card, Table
    panelHover: "#112A45",

    // Border
    border: "rgba(255,255,255,0.08)",
    borderLight: "rgba(59,130,246,0.18)",

    // Primary
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.12)",
    cyan: "#67E8F9",

    // Status
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",

    // Text
    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",
};

// --- 대시보드 미니 뷰어 렌더링 함수 ---
function drawMiniCT(ctx: CanvasRenderingContext2D) {
    const W = 360, H = 260, cx = 180, cy = 130;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#050A16"; ctx.fillRect(0, 0, W, H);

    // CT 흉부 모형
    const bodyG = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    bodyG.addColorStop(0, "#5A5A5A"); bodyG.addColorStop(1, "#7A7A7A");
    ctx.beginPath(); ctx.ellipse(cx, cy, 110, 90, 0, 0, Math.PI * 2); ctx.fillStyle = bodyG; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 45, cy - 10, 45, 60, 0.1, 0, Math.PI * 2); ctx.fillStyle = "#080808"; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 45, cy - 10, 45, 60, -0.1, 0, Math.PI * 2); ctx.fillStyle = "#0A0A0A"; ctx.fill();

    // AI 바운딩 박스 (좌측 폐)
    ctx.strokeStyle = C.danger; ctx.lineWidth = 2; ctx.strokeRect(cx + 25, cy - 40, 40, 35);
    ctx.fillStyle = C.danger; ctx.fillRect(cx + 25, cy - 58, 80, 18);
    ctx.fillStyle = "#000"; ctx.font = "bold 10px sans-serif"; ctx.fillText("Nodule 94%", cx + 30, cy - 46);
}

const getDiagnosisColor = (result: string) => {
    switch (result) {
        case "ABNORMAL":
            return C.danger;
        case "SUSPICIOUS":
            return C.warning;
        case "NORMAL":
            return C.success;
        default:
            return C.textMuted;
    }
};

const getDiagnosisText = (result: string) => {
    switch (result) {
        case "ABNORMAL":
            return "이상 발견";
        case "SUSPICIOUS":
            return "의심";
        case "NORMAL":
            return "정상";
        default:
            return "판독 결과 없음";
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [patients, setPatients] = useState<any[]>([]);
    const [studies, setStudies] = useState<any[]>([]);
    const [analyses, setAnalyses] = useState<any[]>([]);

    useEffect(() => {

        const loadDashboard = async () => {
            try {
                const patientRes = await PatientApi.getAll();
                const studyRes = await StudyApi.getAll();
                const aiRes = await AiAnalysisApi.getAll();

                setPatients(patientRes);
                setStudies(studyRes.data);
                setAnalyses(aiRes.data);

            } catch(e){
                console.error("dashboard error", e);
            }
        };
        loadDashboard();
    },[]);

    const totalStudies = studies.length;

    const totalPatients = patients.length;

    const completedAnalyses = analyses.length;

    const abnormalCount =
        analyses.filter(
            a =>
                a.diagnosisResult === "ABNORMAL" ||
                a.diagnosisResult === "SUSPICIOUS"
        ).length;

    const normalCount =
        analyses.filter(
            a => a.diagnosisResult === "NORMAL"
        ).length;

    const suspiciousCount =
        analyses.filter(
            a => a.diagnosisResult === "SUSPICIOUS"
        ).length;

    const onlyAbnormalCount =
        analyses.filter(
            a => a.diagnosisResult === "ABNORMAL"
        ).length;

    const chartData = {

        labels: [ "정상", "의심", "이상"],
        datasets: [
            {
                data: [ normalCount, suspiciousCount,  onlyAbnormalCount ],
                backgroundColor: ["#22C55E", "#F59E0B", "#EF4444" ],
                borderWidth: 0
            }
        ]
    };

    const recentStudies =
        [...studies]
            .sort(
                (a,b)=>
                    new Date(b.createdAt).getTime()
                    -
                    new Date(a.createdAt).getTime()
            )
            .slice(0,4)
            .map(study => ({
                ...study,
                aiAnalysis: analyses.find(
                    a => a.studyId === study.id
                )
            }));

    const KPI_DATA = [
        {title: "전체 환자", count: totalPatients, color: C.text, icon: Users},
        {title: "총 검사 수", count: totalStudies, color: C.text, icon: ScanLine},
        {title: "AI 분석 완료", count: completedAnalyses, color: C.accent, icon: Brain},
        {title: "이상 발견 (응급)", count: abnormalCount, color: C.danger, icon: AlertTriangle},
    ];



    useEffect(() => {
        if (canvasRef.current) drawMiniCT(canvasRef.current.getContext("2d")!);
    }, []);

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text }}>

            <div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0" }}>Overview Analytics</h1>
                <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>AI 판독 대기열 및 최근 분석 상태입니다.</p>
            </div>

            {/* KPI 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                    {KPI_DATA.map((kpi, i) => {
                    const Icon = kpi.icon;

                    return (
                        <div key={i} style={{background: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <div>
                                <div style={{color: C.textFaint, fontSize: "13px", fontWeight: 600, marginBottom: "10px"}}>
                                    {kpi.title}
                                </div>

                                <div style={{fontSize: "28px", fontWeight: 700, color: kpi.color}}>
                                    {kpi.count}
                                </div>
                            </div>

                            <div
                                style={{width: "48px", height: "48px", borderRadius: "12px", background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color}}
                            >
                                <Icon size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 중앙 메인: 좌측 DICOM 뷰어 / 우측 최근 검사 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>

                <div
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden"}}>

                    {/* Header */}
                    <div style={{padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between",alignItems: "center"}}>
                        <h2 style={{margin: 0, fontSize: "18px", fontWeight: 700}}>
                            AI 판독 결과 분포
                        </h2>

                        <div style={{padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textFaint, fontSize: 13}}>
                            전체 기간
                        </div>

                    </div>

                    {/* Body */}
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px"}}>

                        {/* Doughnut */}
                        <div style={{width: 300, height: 300, position: "relative"}}>

                            <Doughnut data={chartData} options={{responsive: true, maintainAspectRatio: false, cutout: "65%",
                                    plugins: {
                                        legend: { display: false}
                                    }
                                }}
                            />

                            {/* 가운데 */}
                            <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pointerEvents: "none"
                                }}
                            >

                                <div style={{color: C.textFaint, fontSize: 14}}>
                                    총 분석
                                </div>

                                <div style={{color: "#fff", fontSize: 34, fontWeight: 700, marginTop: 6}}>
                                    {analyses.length}건
                                </div>

                            </div>

                        </div>

                        {/* 오른쪽 */}
                        <div style={{display: "flex", flexDirection: "column", gap: 28, width: 240}}>

                            {/* NORMAL */}

                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>

                                <div>

                    <span style={{color: "#22C55E", fontSize: 18}}>
                        ●
                    </span>

                    <span style={{marginLeft: 10}}>
                        정상 (NORMAL)
                    </span>

                                </div>

                                <div style={{ textAlign: "right" }}>

                                    <div style={{color: "#fff", fontWeight: 700}}>
                                        {normalCount}건
                                    </div>

                                    <div style={{color: C.textFaint, fontSize: 13}}>
                                        {analyses.length
                                            ? Math.round(normalCount / analyses.length * 100)
                                            : 0}
                                        %
                                    </div>

                                </div>

                            </div>

                            {/* SUSPICIOUS */}

                            <div
                                style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <div>

                    <span style={{color: "#F59E0B", fontSize: 18}}>
                        ●
                    </span>

                    <span style={{marginLeft: 10}}>
                        의심 (SUSPICIOUS)
                    </span>

                                </div>

                                <div style={{ textAlign: "right" }}>

                                    <div style={{color: "#fff", fontWeight: 700}}>
                                        {suspiciousCount}건
                                    </div>

                                    <div style={{color: C.textFaint, fontSize: 13}}>
                                        {analyses.length
                                            ? Math.round(suspiciousCount / analyses.length * 100)
                                            : 0}
                                        %
                                    </div>

                                </div>

                            </div>

                            {/* ABNORMAL */}

                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>

                            <div>

                    <span style={{color: "#EF4444", fontSize: 18}}>
                        ●
                    </span>

                    <span style={{marginLeft: 10}}>
                        이상 (ABNORMAL)
                    </span>

                                </div>

                                <div style={{ textAlign: "right" }}>

                                    <div style={{color: "#fff", fontWeight: 700}}>
                                        {onlyAbnormalCount}건
                                    </div>

                                    <div style={{color: C.textFaint, fontSize: 13}}>
                                        {analyses.length
                                            ? Math.round(onlyAbnormalCount / analyses.length * 100)
                                            : 0}
                                        %
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{padding: "14px 20px", borderTop: `1px solid ${C.border}`, background: C.panel, color: C.textFaint, fontSize: 13}}>
                        ⓘ AI 판독 결과 분포를 확인할 수 있습니다.
                    </div>

                </div>

                {/* 우측: 최근 검사 목록 */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>최근 검사 목록</h2>
                    </div>
                    <div style={{ flex: 1, padding: "0 20px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                            <thead>
                            <tr style={{ color: C.textFaint, borderBottom: `1px solid ${C.border}` }}>
                                <th style={{ padding: "16px 8px", fontWeight: 600 }}>환자</th>
                                <th style={{ padding: "16px 8px", fontWeight: 600 }}>검사 유형</th>
                                  <th style={{ padding: "16px 8px", fontWeight: 600, textAlign: "center" }}>AI 분석</th>
                                <th style={{ padding: "16px 8px", fontWeight: 600 }}>액션</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentStudies.map((st, i) => {

                                const diagnosis = st.aiAnalysis?.diagnosisResult ?? "";
                                const color = getDiagnosisColor(diagnosis);

                                return (
                                    <tr key={i} style={{borderBottom: `1px solid ${C.border}`}}>
                                        <td style={{padding: "14px 8px"}}>
                                            <div style={{fontWeight: 600, color: C.text}}>{st.patientName}</div>
                                            <div style={{
                                                fontSize: "11px",
                                                color: C.textMuted
                                            }}>PID: {st.patientIdentifier}</div>
                                        </td>
                                        <td style={{padding: "14px 8px", color: C.textMuted}}>{st.modality}</td>
                                        <td style={{padding: "14px 8px", textAlign: "center"}}>
                      <span style={{
                          color: color,
                          background: `${color}1A`,
                          border: `1px solid ${color}40`,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700
                      }}>
                        {getDiagnosisText(diagnosis)}
                      </span>
                                        </td>
                                        <td style={{padding: "14px 8px"}}>
                                            <button onClick={() => router.push(`/patients/${st.patientId}`)} style={{
                                                background: C.accent,
                                                color: C.text,
                                                border: `1px solid ${C.borderLight}`,
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                fontSize: "11px",
                                                cursor: "pointer"
                                            }}>
                                                검사 상세
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}