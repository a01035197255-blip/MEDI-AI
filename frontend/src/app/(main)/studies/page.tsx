"use client";

import {useEffect, useMemo, useState} from "react";
import { useRouter } from "next/navigation";
import { StudyApi, StudyResponse, Modality } from "@/services/study";
import { DicomApi, DicomUploadResult} from "@/services/dicom";
import { useSearchParams } from "next/navigation";
import { AiAnalysisApi } from "@/services/AiAnalysis";
import {SeriesApi} from "@/services/series";

// --- Theme Colors ---
const C = {
    bg: "#0B1120",

    surface: "#07182A",      // 상단 영역
    panel: "#0C1F34",        // 테이블, 업로드 영역
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

export default function StudyList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedPatientId = useMemo(() => {
        const pid = searchParams.get("patientId");
        return pid ? Number(pid) : null;
    }, [searchParams]);

    // =========================
    // state
    // =========================
    const [studies, setStudies] = useState<StudyResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

    const [studyForm, setStudyForm] = useState({
        modality: "CT" as Modality,
        studyDate: "",
        description: ""
    });


    // =========================
    // Study 조회
    // =========================
    const loadStudies = async () => {
        try {
            const studyRes = await StudyApi.getAll();

            console.log("study response", studyRes.data);
            if(studyRes.success){
                setStudies(studyRes.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadStudies();
    }, []);

    // =========================
    // search
    // =========================
    const filteredStudies = studies.filter((s) =>
        s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.modality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // =========================
    // status badge (API 기준)
    // =========================
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "DONE":
                return <span style={{ color: C.success, fontWeight: 600, fontSize: 12 }}>● 완료 (Done)</span>;
            case "PROCESSING":
                return <span style={{ color: C.warning, fontWeight: 600, fontSize: 12 }}>● 분석 중...</span>;
            case "FAILED":
                return <span style={{ color: C.danger, fontWeight: 600, fontSize: 12 }}>● 실패 (Error)</span>;
            default:
                return <span style={{ color: C.textFaint, fontWeight: 600, fontSize: 12 }}>● 대기 (Uploaded)</span>;
        }
    };

    const handleCreateStudy = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatientId) {
            alert("환자를 선택해주세요");
            return;
        }

        await StudyApi.create(selectedPatientId, {
            patientId: selectedPatientId,
            modality: studyForm.modality,
            studyDate: studyForm.studyDate,
            description: studyForm.description
        });

        setIsStudyModalOpen(false);

        setStudyForm({
            modality: "CT",
            studyDate: "",
            description: ""
        });

        await loadStudies();
    };


    // =========================
    // upload (단일)
    // =========================
    const handleUpload = async (
        file: File,
        patientId: number,
        studyId: number
    ) => {
        console.log("patientId =", patientId);
        console.log("studyId =", studyId);
        try {
            await DicomApi.upload(
                file,
                patientId,
                studyId
            );
            await loadStudies();
        } catch(e) {
            console.error(e);
        }
    };

    const handleZipUpload = async (
        file: File,
        patientId:number,
        studyId:number
    ) => {

        try {
            console.log("ZIP upload", file.name);

            await DicomApi.uploadZip(file, patientId, studyId);

            await loadStudies();

        } catch(e){
            console.error(e);
        }
    };

    const handleAnalysis = async ( studyId: number,
                                   studyInstanceUid: string) => {
        try {
            // 1. Study PK 기준으로 Series 조회
            const seriesResponse = await SeriesApi.getByStudy(studyId);

            if (!seriesResponse.success || seriesResponse.data.length === 0) {
                alert("해당 검사에 Series가 없습니다.");
                return;
            }

            const seriesInstanceUid =
                seriesResponse.data[0].seriesInstanceUid;


            // 2. 현재 Study 정보 가져오기
            const study = studies.find(
                (s) => s.id === studyId
            );

            console.log("study =", study);
            console.log("studyInstanceUid =", study?.studyInstanceUid);
            console.log("param studyInstanceUid =", studyInstanceUid);

            if (!study) {
                alert("검사 정보를 찾을 수 없습니다.");
                return;
            }

            // 3. AI 분석 요청
            const response = await AiAnalysisApi.requestAnalysis(
                study.studyInstanceUid,
                seriesInstanceUid
            );


            if (response.success && response.data) {
                const { id: analysisId } = response.data;

                router.push(`/ai-results/${analysisId}`);

            } else {
                alert(
                    response.message ||
                    "AI 분석 요청 중 오류가 발생했습니다."
                );
            }

        } catch (error) {
            console.error("AI Analysis Request Error:", error);
            alert("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "sans-serif" }}>

            <main style={{ flex: 1, padding: "32px 40px" }}>

                {/* Page Title & Search */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>Study Worklist</h1>
                        <p style={{ color: C.textFaint, margin: 0, fontSize: 14 }}>
                            총 {filteredStudies.length}건의 검사가 조회되었습니다.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <input
                            type="text"
                            placeholder="환자명 또는 검사 종류 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: 260,
                                padding: "10px 16px",
                                borderRadius: 6,
                                background: C.surface,
                                border: `1px solid ${C.borderLight}`,
                                color: C.text,
                                outline: "none"
                            }}
                        />
                        <button style={{
                            padding: "0 20px",
                            borderRadius: 6,
                            background: C.accentDim,
                            color: C.accent,
                            border: `1px solid rgba(0, 209, 255, 0.25)`,
                            fontWeight: 600,
                            cursor: "pointer"
                        }}>
                            검색
                        </button>

                        <button
                            onClick={() => setIsStudyModalOpen(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px 18px",
                                background: C.accent,
                                color: "#000",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer"
                            }}
                        >
                            + 검사 생성
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                        <tr style={{ background: C.panel, borderBottom: `1px solid ${C.borderLight}` }}>
                            {["Patient ID", "환자명", "성별/나이", "Modality", "검사명 (Description)", "검사 일자", "AI 상태", "액션"].map((head) => (
                                <th key={head} style={{ padding: "16px", fontSize: 12, fontWeight: 600, color: C.textFaint }}>
                                    {head}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {filteredStudies.map((study) => (
                            <tr
                                key={study.id}
                                onClick={() => handleAnalysis(study.id,
                                    study.studyInstanceUid)}
                                style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.panel}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <td style={{ padding: "16px", fontSize: 14, fontFamily: "monospace", color: C.textMuted }}>
                                    {study.patientIdentifier}
                                </td>

                                {/* API에 없음 → placeholder 유지 */}
                                <td style={{ padding: "16px", fontSize: 14, fontWeight: 500 }}>
                                    {study.patientName}
                                </td>

                                <td style={{ padding: "16px", fontSize: 13, color: C.textMuted }}>
                                    {study.patientSex} ({study.patientAge}세)
                                </td>

                                <td style={{ padding: "16px" }}>
                                    <span style={{
                                        background: C.card,
                                        border: `1px solid ${C.borderLight}`,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: C.accent
                                    }}>
                                        {study.modality}
                                    </span>
                                </td>

                                <td style={{ padding: "16px", fontSize: 14, color: C.textMuted }}>
                                    {study.description ?? "-"}
                                </td>

                                <td style={{ padding: "16px", fontSize: 13, color: C.textFaint }}>
                                    {study.studyDate}
                                </td>

                                <td style={{ padding: "16px" }}>
                                    {renderStatusBadge(study.status)}
                                </td>

                                <td style={{ padding: "16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>

                                        <input
                                            type="file"
                                            id={`upload-${study.id}`}
                                            hidden
                                            accept=".zip"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();

                                                const file = e.target.files?.[0];

                                                if(file){
                                                    console.log(study);

                                                    handleZipUpload(
                                                        file,
                                                        study.patientId,
                                                        study.id
                                                    );

                                                }

                                                // 같은 파일 다시 선택 가능하게 초기화
                                                e.target.value = "";
                                            }}
                                        />

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                document
                                                    .getElementById(`upload-${study.id}`)
                                                    ?.click();
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                background: "#2563EB",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            업로드
                                        </button>


                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();

                                                const res = await SeriesApi.getByStudy(study.id);

                                                const seriesList = res.data;

                                                if (seriesList.length === 0) {
                                                    alert("Series가 없습니다");
                                                    return;
                                                }

                                                const series = seriesList[0];

                                                router.push( `/viewer/${study.studyInstanceUid}/${series.seriesInstanceUid}`);
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                background: C.accent,
                                                color: "#000",
                                                border: "none",
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            뷰어 열기
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredStudies.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: C.textFaint }}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {isStudyModalOpen && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                    }}>
                        <div style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: "12px",
                            width: "420px",
                            padding: "24px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px"
                            }}>
                                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                                    신규 검사 등록
                                </h2>

                                <button
                                    onClick={() => setIsStudyModalOpen(false)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: C.textFaint,
                                        cursor: "pointer"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateStudy} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                                {/* modality */}
                                <div>
                                    <label style={{ fontSize: "12px", color: C.textFaint }}>Modality *</label>
                                    <select
                                        value={studyForm.modality}
                                        onChange={(e) =>
                                            setStudyForm({ ...studyForm, modality: e.target.value as Modality })
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            background: C.panel,
                                            border: `1px solid ${C.borderLight}`,
                                            borderRadius: "6px",
                                            color: C.text
                                        }}
                                    >
                                        <option value="CT">CT</option>
                                        <option value="MR">MR</option>
                                        <option value="CR">CR</option>
                                        <option value="DX">DX</option>
                                        <option value="US">US</option>
                                        <option value="PT">PT</option>
                                        <option value="MG">MG</option>
                                        <option value="SC">SC</option>
                                    </select>
                                </div>

                                {/* date */}
                                <div>
                                    <label style={{ fontSize: "12px", color: C.textFaint }}>검사 날짜 *</label>
                                    <input
                                        type="date"
                                        required
                                        value={studyForm.studyDate}
                                        onChange={(e) => setStudyForm({ ...studyForm, studyDate: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            background: C.panel,
                                            border: `1px solid ${C.borderLight}`,
                                            borderRadius: "6px",
                                            color: C.text
                                        }}
                                    />
                                </div>

                                {/* description */}
                                <div>
                                    <label style={{ fontSize: "12px", color: C.textFaint }}>설명</label>
                                    <input
                                        value={studyForm.description}
                                        onChange={(e) => setStudyForm({ ...studyForm, description: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            background: C.panel,
                                            border: `1px solid ${C.borderLight}`,
                                            borderRadius: "6px",
                                            color: C.text
                                        }}
                                    />
                                </div>

                                {/* buttons */}
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsStudyModalOpen(false)}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            background: "transparent",
                                            color: C.text,
                                            border: `1px solid ${C.borderLight}`,
                                            borderRadius: "6px",
                                            fontWeight: 600
                                        }}
                                    >
                                        취소
                                    </button>

                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            background: C.accent,
                                            color: "#000",
                                            border: "none",
                                            borderRadius: "6px",
                                            fontWeight: 700
                                        }}
                                    >
                                        생성
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}