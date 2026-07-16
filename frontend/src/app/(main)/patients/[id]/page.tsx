"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientApi } from "@/services/patient";
import { StudyApi, StudyResponse } from "@/services/study";
import {AiAnalysisApi, AiAnalysisResponse} from "@/services/AiAnalysis";

// --- 테마 색상 ---
const C = {
    bg: "#0B1120",

    surface: "#07182A",
    panel: "#0C1F34",
    card: "#0C1F34",

    border: "#1E293B",
    borderLight: "#334155",

    accent: "#3B82F6",
    accentDim: "rgba(59, 130, 246, 0.12)",

    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
};

// --- 아이콘 ---
const Icons = {
    Back: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    )
};

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const tabs = ["기본 정보", "검사 내역", "AI 분석 결과"];

    const [activeTab, setActiveTab] = useState("기본 정보");

    // =========================
    // API 상태
    // =========================
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [analyses, setAnalyses] = useState<AiAnalysisResponse[]>([]);

    const [studies, setStudies] = useState<StudyResponse[]>([]);

    const totalStudy = studies.length;

    const aiCompleted = analyses.length;

    const abnormal =
        analyses.filter(

            a =>
                a.diagnosisResult === "ABNORMAL" ||
                a.diagnosisResult === "SUSPICIOUS"

        ).length;

    const latestStudyDate =
        studies.length === 0
            ? "-"
            : studies
                .map(s => s.studyDate)
                .sort()
                .reverse()[0];
    // =========================
    // 상세 조회 API
    // =========================
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);

                const res = await PatientApi.getById(Number(patientId));

                setPatient({
                    name: res.name,
                    gender: res.gender === "M" ? "남성" : "여성",
                    birthDate: res.birthDate,
                    age: res.birthDate
                        ? new Date().getFullYear() - new Date(res.birthDate).getFullYear()
                        : null,
                    phone: res.phone ?? "-",
                    regDate: res.createdAt,
                    patientIdentifier: res.patientIdentifier
                });

            } catch (err) {
                console.error("상세 조회 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) fetchPatient();
    }, [patientId]);

    useEffect(() => {

        const fetchStudies = async () => {
            try {
                const res = await StudyApi.getByPatientId(
                    Number(patientId)
                );

                console.log("study response =", res);

                setStudies(res);
            } catch (err) {
                console.error(
                    "검사 목록 조회 실패:",
                    err
                );
            }
        };
        if(patientId){
            fetchStudies();
        }
    }, [patientId]);

    useEffect(() => {

        async function fetchAnalysis(){

            try{
                const res = await AiAnalysisApi.getAll();

                if(res.success){
                    const patientAnalysis = res.data.filter(a =>

                            studies.some(s => s.id === a.studyId));

                    setAnalyses(patientAnalysis);

                }
            }catch(e){
                console.error(e);
            }
        }
        if(studies.length){
            fetchAnalysis();
        }

   }, [studies]);

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text, position: "relative" }}>

            {/* ── 1. 상단 타이틀 및 액션 버튼 ── */}
            <div>
                <button
                    onClick={() => router.push('/patients')}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: C.textFaint, cursor: "pointer", marginBottom: "16px", padding: 0, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.textFaint}
                >
                    <Icons.Back /> <span style={{ fontSize: "14px", fontWeight: 600 }}>목록으로 돌아가기</span>
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                            {patient?.name}
                            <span style={{ fontSize: "14px", fontWeight: 500, color: C.textMuted, background: C.panel, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${C.borderLight}` }}>
                                {patient?.gender}· {patient?.age}세
                            </span>
                        </h1>
                        <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>PID: {patientId} | DOB: {patient?.dob}</p>
                    </div>
                </div>
            </div>

            {/* ── 2. 탭 네비게이션 ── */}
            <div style={{ display: "flex", gap: "24px", borderBottom: `1px solid ${C.border}` }}>
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

            {/* ── 3. 본문 컨텐츠 (기본 정보 탭) ── */}
            {activeTab === "기본 정보" && (
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>

                    {/* 좌측: 환자 상세 정보 */}
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 20px 0" }}>기본 정보</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", fontSize: "14px" }}>
                            <div style={{ color: C.textFaint }}>환자 ID</div><div style={{ color: C.text, fontFamily: "monospace" }}>{patient?.patientIdentifier}</div>
                            <div style={{ color: C.textFaint }}>이름</div><div style={{ color: C.text }}>{patient?.name}</div>
                            <div style={{ color: C.textFaint }}>생년월일</div><div style={{ color: C.text }}>{patient?.dob} ({patient?.age}세)</div>
                            <div style={{ color: C.textFaint }}>성별</div><div style={{ color: C.text }}>{patient?.gender}</div>
                            <div style={{ color: C.textFaint }}>연락처</div><div style={{ color: C.text }}>{patient?.phone}</div>
                            <div style={{ color: C.textFaint }}>등록일</div><div style={{ color: C.text }}>{patient?.regDate}</div>
                        </div>
                    </div>

                    {/* 우측: 통계 및 최근 검사 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 20px 0" }}>통계 정보</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textFaint }}>총 검사 수</span><span style={{ fontWeight: 600 }}>{totalStudy}건</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textFaint }}>AI 분석 완료</span><span style={{ fontWeight: 600 }}>{aiCompleted}건</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textFaint }}>이상 발견</span><span style={{ fontWeight: 600, color: C.danger }}>{abnormal}건</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.textFaint }}>최근 검사일</span><span style={{ fontWeight: 600 }}>{latestStudyDate}</span></div>
                            </div>
                        </div>

                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>최근 검사 내역</h2>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {studies.map((study, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: C.panel, borderRadius: "6px", border: `1px solid ${C.borderLight}` }}>
                                        <div>
                                            <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{study.modality}</div>
                                            <div style={{ fontSize: "11px", color: C.textFaint, marginTop: "4px" }}>{study.studyDate}</div>
                                        </div>
                                        <span style={{ fontSize: "11px", fontWeight: 700, color:
                                                study.status === "DONE"
                                                    ? C.success
                                                    : C.warning,
                                            background:
                                                study.status === "DONE"
                                                    ? `${C.success}1A`
                                                    : `${C.warning}1A`, padding: "4px 8px", borderRadius: "4px" }}>
                                            {
                                            study.status === "UPLOADED"
                                                ? "업로드 완료"
                                                : study.status === "PROCESSING"
                                                ? "분석 중"
                                                : study.status === "DONE"
                                                ? "분석 완료"
                                                : study.status === "FAILED"
                                                ? "분석 실패"
                                                : "-"
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => router.push('/studies')} style={{ width: "100%", marginTop: "16px", padding: "10px", background: "transparent", border: `1px solid ${C.borderLight}`, color: C.textMuted, borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                전체 검사 내역 보기
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === "검사 내역" && (
                <div
                    style={{
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:"12px",
                        padding:"24px"
                    }}
                >

                    <h2
                        style={{
                            fontSize:"18px",
                            fontWeight:700,
                            marginBottom:"20px"
                        }}
                    >
                        검사 내역
                    </h2>


                    {/* 헤더 */}
                    <div
                        style={{
                            display:"grid",
                            gridTemplateColumns:"1.2fr 1fr 1fr 1fr 2fr 1fr",
                            padding:"12px 16px",
                            background:C.panel,
                            color:C.textFaint,
                            fontSize:"13px",
                            fontWeight:700,
                            borderRadius:"8px 8px 0 0"
                        }}
                    >
                        <div>Patient ID</div>
                        <div>환자명</div>
                        <div>성별/나이</div>
                        <div>Modality</div>
                        <div>검사명</div>
                        <div>검사 일자</div>
                    </div>


                    {studies.length === 0 ? (

                        <div
                            style={{
                                padding:"40px",
                                textAlign:"center",
                                color:C.textFaint
                            }}
                        >
                            검사 내역이 없습니다.
                        </div>

                    ) : (

                        studies.map((study)=>(
                            <div
                                key={study.studyInstanceUid}
                                style={{
                                    display:"grid",
                                    gridTemplateColumns:"1.2fr 1fr 1fr 1fr 2fr 1fr",
                                    alignItems:"center",
                                    padding:"16px",
                                    borderBottom:`1px solid ${C.border}`,
                                    fontSize:"14px",
                                    transition:"0.2s"
                                }}
                            >

                                <div
                                    style={{
                                        fontFamily:"monospace",
                                        color:C.accent
                                    }}
                                >
                                    {patient?.patientIdentifier}
                                </div>


                                <div>
                                    {patient?.name}
                                </div>


                                <div>
                                    {patient?.gender} / {patient?.age}세
                                </div>


                                <div>

                        <span
                            style={{
                                background:C.accentDim,
                                color:C.accent,
                                padding:"5px 12px",
                                borderRadius:"20px",
                                fontSize:"12px",
                                fontWeight:700
                            }}
                        >
                            {study.modality}
                        </span>

                                </div>
                                <div>
                                    {study.description ?? "-"}
                                </div>

                                <div
                                    style={{
                                        color:C.textMuted
                                    }}
                                >
                                    {study.studyDate}
                                </div>
                            </div>
                        ))

                    )}

                </div>
            )}

            {activeTab === "AI 분석 결과" && (

                <div
                    style={{
                        background:C.surface,
                        border:`1px solid ${C.border}`,
                        borderRadius:"12px",
                        padding:"24px"
                    }}
                >

                    <h2
                        style={{
                            fontSize:"18px",
                            fontWeight:700,
                            marginBottom:"20px"
                        }}
                    >
                        AI 분석 결과
                    </h2>

                    {/* 헤더 */}

                    <div
                        style={{
                            display:"grid",
                            gridTemplateColumns:"80px 1fr 1fr 140px 120px 120px",
                            padding:"12px 16px",
                            background:C.panel,
                            color:C.textFaint,
                            fontSize:"13px",
                            fontWeight:700,
                            borderRadius:"8px 8px 0 0"
                        }}
                    >
                        <div>ID</div>
                        <div>AI 소견</div>
                        <div>AI 모델</div>
                        <div>판독 결과</div>
                        <div>분석일</div>
                        <div>상세</div>
                    </div>

                    {
                        analyses.length === 0 ?

                            <div
                                style={{
                                    padding:"40px",
                                    textAlign:"center",
                                    color:C.textFaint
                                }}
                            >
                                AI 분석 결과가 없습니다.
                            </div>

                            :

                            analyses.map((res)=>(

                                <div
                                    key={res.id}
                                    style={{
                                        display:"grid",
                                        gridTemplateColumns:"80px 1fr 1fr 140px 120px 120px",
                                        alignItems:"center",
                                        padding:"16px",
                                        borderBottom:`1px solid ${C.border}`,
                                        fontSize:"14px"
                                    }}
                                >

                                    <div
                                        style={{
                                            color:C.accent,
                                            fontFamily:"monospace"
                                        }}
                                    >
                                        {res.id}
                                    </div>

                                    <div>
                                        {res.findings?.[0]?.labelKo ?? "-"}
                                    </div>

                                    <div>
                                        {res.modelName}
                                    </div>

                                    <div>

                    <span
                        style={{
                            padding:"5px 12px",
                            borderRadius:"20px",
                            fontSize:"12px",
                            fontWeight:700,
                            background:
                                res.diagnosisResult==="ABNORMAL"
                                    ?"rgba(239,68,68,.15)"
                                    :res.diagnosisResult==="SUSPICIOUS"
                                        ?"rgba(245,158,11,.15)"
                                        :"rgba(34,197,94,.15)",

                            color:
                                res.diagnosisResult==="ABNORMAL"
                                    ?C.danger
                                    :res.diagnosisResult==="SUSPICIOUS"
                                        ?C.warning
                                        :C.success
                        }}
                    >
                        {res.diagnosisResult}
                    </span>

                                    </div>

                                    <div>
                                        {res.createdAt}
                                    </div>

                                    <div>

                                        <button

                                            onClick={()=>

                                                router.push(
                                                    `/ai-results/${res.id}`
                                                )

                                            }

                                            style={{

                                                padding:"6px 12px",

                                                background:C.accentDim,

                                                color:C.accent,

                                                border:`1px solid ${C.borderLight}`,

                                                borderRadius:6,

                                                cursor:"pointer"

                                            }}

                                        >

                                            결과 보기

                                        </button>

                                    </div>

                                </div>

                            ))

                    }

                </div>

            )}

        </div>
    );
}