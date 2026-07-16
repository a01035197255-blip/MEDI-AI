"use client";

import { useRouter } from "next/navigation";
import { useSearch} from "@/app/context/SearchContext";

const C = {
    surface: "#07182A",                         // Header 배경
    panel: "#0C1F34",                           // 검색창 등 내부 요소
    border: "rgba(255,255,255,0.08)",
    borderLight: "rgba(59,130,246,0.18)",

    text: "#FFFFFF",
    textFaint: "#94A3B8",

    primary: "#3B82F6",
};

export default function Header() {
    const router = useRouter();

    const {
        globalSearch,
        setGlobalSearch,
    } = useSearch();

    const handleSearch = () => {
        const keyword = globalSearch.trim();

        if (!keyword) {
            alert("검색어를 입력하세요.");
            return;
        }

        router.push(
            `/patients?search=${encodeURIComponent(keyword)}`
        );
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <header
            style={{
                height: "56px",
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: C.panel,
                        border: `1px solid ${C.borderLight}`,
                        borderRadius: "6px",
                        padding: "8px 16px",
                        width: "340px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="환자명 또는 환자ID 검색..."
                        value={globalSearch}
                        onChange={(e) =>
                            setGlobalSearch(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: C.text,
                            width: "100%",
                            outline: "none",
                            fontSize: "13px",
                        }}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    style={{
                        height: "40px",
                        padding: "0 18px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: C.primary,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "13px",
                    }}
                >
                    검색
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderLeft: `1px solid ${C.border}`,
                        paddingLeft: "20px",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            background: C.panel,
                            border: `1px solid ${C.borderLight}`,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                        }}
                    >
                        👨‍⚕️
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
            <span
                style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.text,
                }}
            >
              의사
            </span>

                        <span
                            style={{
                                fontSize: "11px",
                                color: C.textFaint,
                            }}
                        >
              Doctor
            </span>
                    </div>
                </div>
            </div>
        </header>
    );
}