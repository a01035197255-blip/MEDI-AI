"use client";

import { useRouter } from "next/navigation";
import { useSearch } from "@/app/context/SearchContext";
import { AiAnalysisApi, AiAnalysisResponse, DiagnosisResult} from "@/services/AiAnalysis";
import { useEffect, useState } from "react";

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

// --- 공통 아이콘 ---
const Icons = {
    Search: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Refresh: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    ChevronLeft: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
};

export default function AiResultListPage() {
    const router = useRouter();
    const { globalSearch } = useSearch(); // 글로벌 검색 연동

    // 로컬 필터 상태
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [modelFilter, setModelFilter] = useState("ALL");

    const [results, setResults] = useState<AiAnalysisResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const response = await AiAnalysisApi.getAll();

                if(response.success){
                    setResults(response.data);
                }
            } catch(e) {
                console.error("AI result load error:", e);
            } finally {
                setLoading(false);
            }
        };
        loadResults();
    }, []);

    // 필터링 로직 (글로벌 검색어 + 로컬 콤보박스 필터)
    const filteredResults = results.filter(r => {

        const matchSearch =
            r.patientName.toLowerCase().includes(globalSearch.toLowerCase()) ||
            r.patientIdentifier.toLowerCase().includes(globalSearch.toLowerCase()) ||
            String(r.id).includes(globalSearch);

        const matchStatus =
            statusFilter === "ALL" ||
            r.diagnosisResult === statusFilter;

        const matchModel =
            modelFilter === "ALL" ||
            (r.modelName?.includes(modelFilter) ?? false);

        return matchSearch && matchStatus && matchModel;
    });

    // 뱃지 색상 렌더러
    const renderStatusBadge = (status: DiagnosisResult) => {

        let text = "";
        let bgColor = "";
        let textColor = "";

        if(status === "ABNORMAL"){
            text = "이상 발견";
            bgColor = "rgba(239,68,68,0.1)";
            textColor = C.danger;

        }else if(status === "SUSPICIOUS"){
            text = "의심";
            bgColor = "rgba(250,204,21,0.1)";
            textColor = C.warning;

        }else{
            text = "정상";
            bgColor = "rgba(16,185,129,0.1)";
            textColor = C.success;
        }

        return (
            <span style={{
                background:bgColor,
                color:textColor,
                padding:"4px 8px",
                borderRadius:"4px",
                fontSize:"11px",
                fontWeight:700,
                border:`1px solid ${textColor}40`
            }}>
            {text}
        </span>
        );
    };

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text }}>

            {/* ── 1. 페이지 헤더 ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0" }}>AI 분석 결과 목록</h1>
                    <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>PACS 시스템 내 모든 AI 판독 결과를 조회하고 관리합니다.</p>
                </div>
            </div>

            {/* ── 2. 상세 검색 필터 ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>

                    {/* 상태 필터 */}
                    <div style={{ width: "160px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>판독 결과</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none", appearance: "none" }}>
                            <option value="ALL">전체 결과</option>
                            <option value="ABNORMAL">이상 발견</option>
                            <option value="SUSPICIOUS">의심</option>
                            <option value="NORMAL">정상</option>
                        </select>
                    </div>

                    {/* 모델 필터 */}
                    <div style={{ width: "180px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>AI 모델</label>
                        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none", appearance: "none" }}>
                            <option value="ALL">전체 모델</option>
                            <option value="LUNG">LUNG-DETECT (폐)</option>
                            <option value="NEURO">NEURO-SCAN (뇌)</option>
                            <option value="LIVER">LIVER-AI (간)</option>
                        </select>
                    </div>

                    <div style={{ flex: 1 }} /> {/* 빈 공간 밀기 */}

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => { setStatusFilter("ALL"); setModelFilter("ALL"); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: C.panel, color: C.text, border: `1px solid ${C.borderLight}`, borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                            <Icons.Refresh /> 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 3. AI 분석 목록 테이블 ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: C.textMuted }}>총 <b style={{ color: C.text }}>{filteredResults.length}</b>건의 분석 결과</span>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                        <thead>
                        <tr style={{ background: C.panel, color: C.textFaint, borderBottom: `1px solid ${C.border}` }}>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>분석 ID</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>환자 정보</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>AI 소견</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>AI 모델</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>판독 결과</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>위험도 점수</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>분석 일시</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "center" }}>작업</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredResults.map((res) => {

                            const score =
                                res.findings.length > 0
                                    ? Math.max(
                                        ...res.findings.map((f) => {
                                            switch (f.riskLevel) {
                                                case "CRITICAL": return 100;
                                                case "HIGH": return 80;
                                                case "MEDIUM": return 50;
                                                case "LOW": return 20;
                                                default: return 0;
                                            }
                                        })
                                    )
                                    : 0;
                        return (
                            <tr key={res.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.panel} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                <td style={{ padding: "14px 20px", color: C.textMuted, fontFamily: "monospace" }}>{res.id}</td>
                                <td style={{ padding: "14px 20px" }}>
                                    <div style={{ fontWeight: 600, color: C.text }}>{res.patientName}</div>
                                    <div style={{ fontSize: "11px", color: C.textFaint, marginTop: "2px" }}>{res.patientIdentifier}</div>
                                </td>
                                <td style={{ padding: "14px 20px", color: C.textMuted }}>{res.findings?.[0]?.labelKo ?? "-"}</td>
                                <td style={{ padding: "14px 20px", color: C.textMuted }}>{res.modelName}</td>
                                <td style={{ padding: "14px 20px" }}>{renderStatusBadge(res.diagnosisResult)}</td>
                                <td style={{ padding: "14px 20px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "50px", height: "4px", background: C.borderLight, borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ width: `${score}%`, height: "100%", background: score >= 80 ? C.danger : (score >= 50 ? C.warning : C.success) }} />
                                        </div>
                                        <span style={{ fontSize: "12px", color: C.textMuted }}>{score}점</span>
                                    </div>
                                </td>
                                <td style={{ padding: "14px 20px", color: C.textFaint }}>{res.createdAt}</td>
                                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                                    <button onClick={(e) => { e.stopPropagation(); router.push(`/ai-results/${res.id}`); }} style={{ background: "transparent", color: C.accent, border: `1px solid ${C.borderLight}`, padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                        결과 보기
                                    </button>
                                </td>
                            </tr>
                         );
                        })}
                        {filteredResults.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center", color: C.textFaint }}>
                                    조건에 맞는 분석 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", borderTop: `1px solid ${C.borderLight}` }}>
                    <button style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: C.textFaint, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icons.ChevronLeft /></button>
                    <button style={{ width: "32px", height: "32px", background: C.accentDim, color: C.accent, border: `1px solid ${C.accentDim}`, borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>1</button>
                    <button style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: C.textFaint, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icons.ChevronRight /></button>
                </div>

            </div>
        </div>
    );
}