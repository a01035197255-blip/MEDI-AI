"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PatientApi } from "@/services/patient";

// --- 테마 색상 (그대로 유지) ---
const C = {
    bg: "#0B1120",

    surface: "#07182A",      // 상단 영역
    panel: "#0C1F34",        // 테이블, 검색창
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

// --- 공통 아이콘 ---
const Icons = {
    Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Search: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Refresh: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Close: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function PatientsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // =========================
    // API 데이터 상태
    // =========================
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // =========================
    // 필터 상태
    // =========================
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("ALL");
    const [ageFilter, setAgeFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("ALL");

    // =========================
    // 모달 상태
    // =========================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPtName, setNewPtName] = useState("");
    const [newPtDob, setNewPtDob] = useState("");
    const [newPtGender, setNewPtGender] = useState("남");
    const [newPtPhone, setNewPtPhone] = useState("");

    // =========================
    // 환자 목록 조회 API
    // =========================
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const res = await PatientApi.getAll();

                const mapped = res.map(p => {
                    const birthYear = p.birthDate
                        ? new Date(p.birthDate).getFullYear()
                        : 0;

                    const age = birthYear
                        ? new Date().getFullYear() - birthYear
                        : 0;

                    return {
                        id: p.id,
                        patientIdentifier: p.patientIdentifier,
                        name: p.name,
                        dob: p.birthDate,
                        age,
                        gender: p.gender === "M" ? "남" : "여",
                        phone: p.phone ?? "-",
                        regDate: p.createdAt?.split("T")[0] || ""
                    };
                });

                setPatients(mapped);
            } catch (err) {
                console.error("환자 조회 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // =========================
    // URL 검색어 유지
    // =========================
    useEffect(() => {
        const keyword = searchParams.get("search");
        if (keyword) {
            setSearchTerm(keyword);
        }
    }, [searchParams]);

    // =========================
    // 필터 초기화
    // =========================
    const resetFilters = () => {
        setSearchTerm("");
        setGenderFilter("ALL");
        setAgeFilter("ALL");
        setDateFilter("ALL");
        router.push("/patients");
    };

    // =========================
    // 환자 등록 API
    // =========================
    const handleRegisterPatient = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await PatientApi.create({
                name: newPtName,
                birthDate: newPtDob,
                gender: newPtGender === "남" ? "M" : "F",
                phone: newPtPhone
            });

            const birthYear = res.birthDate
                ? new Date(res.birthDate).getFullYear()
                : 0;

            const age = birthYear
                ? new Date().getFullYear() - birthYear
                : 0;

            const newPatient = {
                id: res.id,
                patientIdentifier: res.patientIdentifier,
                name: res.name,
                dob: res.birthDate,
                age,
                gender: res.gender === "M" ? "남" : "여",
                phone: res.phone ?? "-",
                regDate: res.createdAt?.split("T")[0] || ""
            };

            setPatients(prev => [newPatient, ...prev]);

            setIsModalOpen(false);

            setNewPtName("");
            setNewPtDob("");
            setNewPtGender("남");
            setNewPtPhone("");

        } catch (err) {
            console.error("환자 등록 실패:", err);
        }
    };

    // =========================
    // 필터 로직 (그대로 유지)
    // =========================
    const filteredPatients = patients.filter(p => {
        const matchKeyword =
            p.name.includes(searchTerm) || String(p.id).includes(searchTerm);

        const matchGender =
            genderFilter === "ALL" ||
            (genderFilter === "M" && p.gender === "남") ||
            (genderFilter === "F" && p.gender === "여");

        let matchAge = true;
        if (ageFilter !== "ALL") {
            if (ageFilter === "20s") matchAge = p.age < 30;
            else if (ageFilter === "30s") matchAge = p.age >= 30 && p.age < 40;
            else if (ageFilter === "40s") matchAge = p.age >= 40 && p.age < 50;
            else if (ageFilter === "50s") matchAge = p.age >= 50;
        }

        let matchDate = true;
        if (dateFilter !== "ALL") {
            const ptDate = new Date(p.regDate).getTime();
            const today = new Date().getTime();
            const diffDays = (today - ptDate) / (1000 * 3600 * 24);

            if (dateFilter === "TODAY") matchDate = diffDays < 1;
            else if (dateFilter === "WEEK") matchDate = diffDays <= 7;
            else if (dateFilter === "MONTH") matchDate = diffDays <= 30;
        }

        return matchKeyword && matchGender && matchAge && matchDate;
    });

    return (
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", color: C.text, position: "relative" }}>

            {/* ── 1. 페이지 헤더 ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0" }}>환자 목록 (Patients)</h1>
                    <p style={{ color: C.textFaint, fontSize: "13px", margin: 0 }}>등록된 전체 환자 데이터를 조회하고 관리합니다.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
                        background: C.accent, color: "#000", border: "none", borderRadius: "6px",
                        fontSize: "13px", fontWeight: 700, cursor: "pointer"
                    }}
                >
                    <Icons.Plus /> 환자 등록
                </button>
            </div>

            {/* ── 2. 상세 검색 필터 ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 16px 0", color: C.textMuted }}>환자 상세 검색</h2>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>이름 또는 환자ID</label>
                        <input
                            type="text" placeholder="이름, 환자ID 입력..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none" }}
                        />
                    </div>

                    <div style={{ width: "140px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>성별</label>
                        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none", appearance: "none" }}>
                            <option value="ALL">전체</option>
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>

                    <div style={{ width: "140px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>연령대</label>
                        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none", appearance: "none" }}>
                            <option value="ALL">전체</option>
                            <option value="20s">20대 이하</option>
                            <option value="30s">30대</option>
                            <option value="40s">40대</option>
                            <option value="50s">50대 이상</option>
                        </select>
                    </div>

                    <div style={{ width: "160px" }}>
                        <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>등록일자</label>
                        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, fontSize: "13px", outline: "none", appearance: "none" }}>
                            <option value="ALL">전체 기간</option>
                            <option value="TODAY">오늘</option>
                            <option value="WEEK">최근 1주일</option>
                            <option value="MONTH">최근 1개월</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", background: C.panel, color: C.text, border: `1px solid ${C.borderLight}`, borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                            <Icons.Refresh /> 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 3. 환자 리스트 테이블 ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: C.textMuted }}>총 <b style={{ color: C.text }}>{filteredPatients.length}</b>명의 환자</span>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                        <thead>
                        <tr style={{ background: C.panel, color: C.textFaint, borderBottom: `1px solid ${C.border}` }}>
                            <th style={{ padding: "14px 20px", fontWeight: 600, width: "60px" }}></th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>환자명</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>환자 ID</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>생년월일</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>성별</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>연락처</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600 }}>등록일</th>
                            <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "center" }}>작업</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPatients.map((pt) => (
                            <tr key={pt.id} onClick={() => router.push(`/studies?patientId=${pt.id}`)} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.panel} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.panel, border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: "14px" }}>
                                        👤
                                    </div>
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 600, color: C.text }}>{pt.name}</td>
                                <td style={{ padding: "14px 20px", color: C.textMuted, fontFamily: "monospace" }}>{pt.patientIdentifier}</td>
                                <td style={{ padding: "14px 20px", color: C.textMuted }}>{pt.dob} <span style={{ color: C.textFaint, fontSize: "12px", marginLeft: "4px" }}>({pt.age}세)</span></td>
                                <td style={{ padding: "14px 20px", color: C.textMuted }}>{pt.gender}</td>
                                <td style={{ padding: "14px 20px", color: C.textMuted }}>{pt.phone}</td>
                                <td style={{ padding: "14px 20px", color: C.textFaint }}>{pt.regDate}</td>
                                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                                    <button onClick={(e) => { e.stopPropagation(); router.push(`/patients/${pt.id}`); }} style={{ background: "transparent", color: C.accent, border: `1px solid ${C.borderLight}`, padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                                        상세 보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center", color: C.textFaint }}>
                                    검색 조건에 맞는 환자가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── 환자 등록 모달 (Modal) ── */}
            {isModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
                        width: "400px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>신규 환자 등록</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}>
                                <Icons.Close />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterPatient} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>환자명 *</label>
                                <input required type="text" value={newPtName} onChange={e => setNewPtName(e.target.value)} style={{ width: "100%", padding: "10px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, outline: "none" }} />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>생년월일 *</label>
                                    <input required type="date" value={newPtDob} onChange={e => setNewPtDob(e.target.value)} style={{ width: "100%", padding: "10px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, outline: "none" }} />
                                </div>
                                <div style={{ width: "100px" }}>
                                    <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>성별</label>
                                    <select value={newPtGender} onChange={e => setNewPtGender(e.target.value)} style={{ width: "100%", padding: "10px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, outline: "none", appearance: "none" }}>
                                        <option value="남">남성</option>
                                        <option value="여">여성</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: C.textFaint, marginBottom: "6px" }}>연락처</label>
                                <input type="tel" placeholder="010-0000-0000" value={newPtPhone} onChange={e => setNewPtPhone(e.target.value)} style={{ width: "100%", padding: "10px", background: C.panel, border: `1px solid ${C.borderLight}`, borderRadius: "6px", color: C.text, outline: "none" }} />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "12px", background: "transparent", color: C.text, border: `1px solid ${C.borderLight}`, borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>취소</button>
                                <button type="submit" style={{ flex: 1, padding: "12px", background: C.accent, color: "#000", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>등록하기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}