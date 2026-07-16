"use client";

import { useState } from "react";
import { AuthApi } from "@/services/Auth";

// --- 테마 색상 (전체 플랫폼 통일) ---
const C = {
    bg: "#0B1120",

    surface: "#07182A",
    panel: "#0C1F34",
    card: "#0C1F34",

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

export default function SettingsPage() {
    // 탭 상태 관리
    const [activeTab, setActiveTab] = useState("일반");
    const tabs = ["일반", "DICOM / 네트워크", "AI 분석 설정", "계정 및 보안"];

    // 일반 설정 상태
    const [hospitalName, setHospitalName] = useState("메디플러스 종합병원");
    const [language, setLanguage] = useState("ko");
    const [autoLogout, setAutoLogout] = useState("30");

    // DICOM 설정 상태
    const [aeTitle, setAeTitle] = useState("MEDIPACS_SERVER");
    const [port, setPort] = useState("10420");
    const [useWado, setUseWado] = useState(true);

    // AI 설정 상태
    const [autoAnalysis, setAutoAnalysis] = useState(true);
    const [threshold, setThreshold] = useState(75);
    const [alertCritical, setAlertCritical] = useState(true);

    // 저장 완료 알림 상태
    const [showSaveToast, setShowSaveToast] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordToast, setPasswordToast] = useState(false);

    const handleSave = async () => {

        if (activeTab === "계정 및 보안") {

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert("비밀번호를 모두 입력해주세요.");
                return;
            }
            if (newPassword !== confirmPassword) {
                alert("새 비밀번호가 일치하지 않습니다.");
                return;
            }
            try {
                await AuthApi.changePassword({
                    currentPassword,
                    newPassword,
                    confirmPassword
                });

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");


                setShowSaveToast(true);

                setTimeout(() => {
                    setShowSaveToast(false);
                }, 3000);
            } catch (error:any) {

                alert(
                    error.response?.data?.message
                    ?? "비밀번호 변경 실패"
                );
            }
            return;
        }
        // 나머지 설정 저장
        setShowSaveToast(true);

        setTimeout(() => {
            setShowSaveToast(false);
        }, 3000);
    };

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text, fontFamily: "sans-serif", position: "relative" }}>

            {/* ── 1. 페이지 헤더 ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0" }}>시스템 설정</h1>
                    <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>PACS 시스템 환경 및 판독 보조 AI 모델의 파라미터를 구성합니다.</p>
                </div>
                <button
                    onClick={handleSave}
                    style={{ padding: "10px 24px", background: C.accent, color: "#000", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    설정 저장
                </button>
            </div>

            {/* ── 2. 설정 서브 탭 네비게이션 ── */}
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

            {/* ── 3. 설정 본문 영역 ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "32px", maxWidth: "800px" }}>

                {/* 3-1. 일반 설정 탭 */}
                {activeTab === "일반" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>기관/병원명</label>
                            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={{ width: "100%", padding: "12px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "14px", outline: "none" }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>시스템 기본 언어</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: "100%", padding: "12px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "14px", outline: "none" }}>
                                    <option value="ko">한국어 (Korean)</option>
                                    <option value="en">English (US)</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>자동 로그아웃 시간</label>
                                <select value={autoLogout} onChange={e => setAutoLogout(e.target.value)} style={{ width: "100%", padding: "12px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "14px", outline: "none" }}>
                                    <option value="15">15분 미활동 시</option>
                                    <option value="30">30분 미활동 시</option>
                                    <option value="60">1시간 미활동 시</option>
                                    <option value="OFF">사용 안 함</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3-2. DICOM / 네트워크 설정 탭 */}
                {activeTab === "DICOM / 네트워크" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>PACS AE Title</label>
                                <input type="text" value={aeTitle} onChange={e => setAeTitle(e.target.value)} style={{ width: "100%", padding: "12px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "14px", fontFamily: "monospace", outline: "none" }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>DICOM Listen Port</label>
                                <input type="text" value={port} onChange={e => setPort(e.target.value)} style={{ width: "100%", padding: "12px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "14px", fontFamily: "monospace", outline: "none" }} />
                            </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 600 }}>WADO 이미지 압축 스트리밍</div>
                                <div style={{ fontSize: "12px", color: C.textFaint, marginTop: "4px" }}>뷰어 로딩 속도 향상을 위해 데이터 압축 전송 프로토콜을 사용합니다.</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                                <input type="checkbox" checked={useWado} onChange={e => setUseWado(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: useWado ? C.accent : C.panel, borderRadius: "24px", transition: "0.3s" }}>
                                    <span style={{ position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px", background: useWado ? "#000" : C.textFaint, borderRadius: "50%", transition: "0.3s", transform: useWado ? "translateX(20px)" : "none" }} />
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 3-3. AI 분석 설정 탭 */}
                {activeTab === "AI 분석 설정" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 600 }}>DICOM 업로드 시 자동 분석 (Real-time)</div>
                                <div style={{ fontSize: "12px", color: C.textFaint, marginTop: "4px" }}>새로운 이미지가 전송되면 대기 시간 없이 AI 파이프라인 연산을 시작합니다.</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                                <input type="checkbox" checked={autoAnalysis} onChange={e => setAutoAnalysis(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: autoAnalysis ? C.accent : C.panel, borderRadius: "24px", transition: "0.3s" }}>
                                    <span style={{ position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px", background: autoAnalysis ? "#000" : C.textFaint, borderRadius: "50%", transition: "0.3s", transform: autoAnalysis ? "translateX(20px)" : "none" }} />
                                </span>
                            </label>
                        </div>

                        <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label style={{ fontSize: "14px", fontWeight: 600 }}>이상 소견 탐지 임계값 (Threshold)</label>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: C.accent }}>{threshold}% 이상</span>
                            </div>
                            <p style={{ color: C.textFaint, fontSize: "12px", margin: "0 0 8px 0" }}>설정된 확신도 지수 이상의 병변만 워크리스트에 위험군(CRITICAL)으로 분류합니다.</p>
                            <input type="range" min="50" max="95" value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }} />
                        </div>

                        <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 600 }}>위험군 탐지 시 상단 헤더 브로드캐스트 시스템 알림</div>
                                <div style={{ fontSize: "12px", color: C.textFaint, marginTop: "4px" }}>임계값을 넘는 심각한 병변이 확인되면 브라우저 푸시 및 UI 알림 레이어를 노출합니다.</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                                <input type="checkbox" checked={alertCritical} onChange={e => setAlertCritical(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: alertCritical ? C.accent : C.panel, borderRadius: "24px", transition: "0.3s" }}>
                                    <span style={{ position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px", background: alertCritical ? "#000" : C.textFaint, borderRadius: "50%", transition: "0.3s", transform: alertCritical ? "translateX(20px)" : "none" }} />
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 3-4. 계정 및 보안 탭 */}
                {activeTab === "계정 및 보안" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>현재 비밀번호</label>
                            <input
                                type="password"
                                placeholder="현재 비밀번호"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: C.panel,
                                    border: `1px solid ${C.borderLight}`,
                                    borderRadius: "6px",
                                    color: C.text,
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: C.textMuted }}>새 비밀번호</label>
                            <input
                                type="password"
                                placeholder="새로운 비밀번호 입력"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    background: C.panel,
                                    border: `1px solid ${C.borderLight}`,
                                    borderRadius: "6px",
                                    color: C.text,
                                    fontSize: "14px",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>

                            <label style={{
                                fontSize:"13px",
                                fontWeight:600,
                                color:C.textMuted
                            }}>
                                새 비밀번호 확인
                            </label>

                            <input
                                type="password"
                                placeholder="새 비밀번호 다시 입력"
                                value={confirmPassword}
                                onChange={e=>setConfirmPassword(e.target.value)}
                                style={{
                                    width:"100%",
                                    padding:"12px",
                                    background:C.panel,
                                    border:`1px solid ${C.borderLight}`,
                                    borderRadius:"6px",
                                    color:C.text,
                                    fontSize:"14px",
                                    outline:"none"
                                }}
                            />

                        </div>
                        <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: "20px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: C.danger }}>계정 비활성화</div>
                            <p style={{ color: C.textFaint, fontSize: "12px", marginTop: "4px", marginBottom: "16px" }}>이 의사 계정을 아키텍처 비활성화 그룹으로 변경합니다. 로그인 및 판독 권한이 정지됩니다.</p>
                            <button style={{ padding: "10px 16px", background: "rgba(239, 68, 68, 0.1)", color: C.danger, border: `1px solid ${C.danger}40`, borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>계정 정지 요청</button>
                        </div>
                    </div>
                )}

            </div>

            {/* ── 4. 저장 성공 알림 토스트 (Toast) ── */}
            {showSaveToast && (
                <div style={{
                    position: "fixed", bottom: "40px", right: "40px",
                    background: C.panel, border: `1px solid ${C.success}`, borderRadius: "8px",
                    padding: "16px 24px", color: C.text, fontSize: "14px", fontWeight: 600,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", zIndex: 2000,
                    display: "flex", alignItems: "center", gap: "10px"
                }}>
                    <span style={{ color: C.success }}>✓</span> 변경사항이 시스템에 안전하게 반영되었습니다.
                </div>
            )}

        </div>
    );
}