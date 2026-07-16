"use client";

import { useRouter, usePathname } from "next/navigation";
import { AuthApi } from "@/services/Auth";

// --- 테마 색상 ---
const C = {
    surface: "#07182A",                         // Sidebar 배경
    border: "rgba(255,255,255,0.08)",          // 테두리

    accent: "#3B82F6",                         // 선택 메뉴
    accentDim: "rgba(59,130,246,0.12)",

    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",

    danger: "#EF4444",
};

// --- 사이드바 아이콘 모음 (SVG) ---
const Icons = {
    Dashboard: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Users: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Studies: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm0 4h1v1H9v-1zm0 4h1v1H9v-1zm3-8h1v1h-1V7zm0 4h1v1h-1v-1zm0 4h1v1h-1v-1zm3-8h1v1h-1V7zm0 4h1v1h-1v-1zm0 4h1v1h-1v-1z" /></svg>,
    AiResult: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Chart: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
    Settings: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Logout: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

// --- 전체 메뉴 리스트 ---
const MENUS = [
    { name: "대시보드", path: "/dashboard", icon: <Icons.Dashboard /> },
    { name: "환자 목록", path: "/patients", icon: <Icons.Users /> },
    { name: "검사 목록", path: "/studies", icon: <Icons.Studies /> },
    { name: "AI 분석 결과", path: "/ai-results", icon: <Icons.AiResult /> },
    { name: "통계 및 차트", path: "/statistics", icon: <Icons.Chart /> },
    { name: "설정", path: "/settings", icon: <Icons.Settings /> },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await AuthApi.logout();

            // (선택) 로컬 토큰 삭제
            localStorage.removeItem("token");
            sessionStorage.clear();

            router.push("/auth/login")
        } catch (e) {
            console.error("로그아웃 실패:", e);

            // 실패해도 그냥 로그인 이동 (UX)
            router.push("/auth/login")
        }
    };

    return (
        <aside style={{ width: "240px", background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

            {/* 1. 상단 로고 */}
            <div style={{ height: "64px", display: "flex", alignItems: "center", padding: "0 24px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff" }}>
                    <svg
                        viewBox="0 0 24 24"
                        width="34"
                        height="34"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        style={{
                            flexShrink: 0,
                            color: "#60A5FA",
                            filter: "drop-shadow(0 0 14px rgba(59,130,246,0.65))"
                        }}
                    >
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="6" cy="12" r="2" />
                        <circle cx="18" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                        <path d="M12 7v10M6 12h12" />
                    </svg>

                    <span>MEDI AI</span>
                </div>
            </div>

            {/* 2. 중앙 스크롤 메뉴 리스트 */}
            <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
                {MENUS.map(menu => {
                    const isActive = pathname.startsWith(menu.path);
                    return (
                        <button key={menu.name} onClick={() => router.push(menu.path)}
                                style={{
                                    display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                                    background: isActive ? C.accentDim : "transparent",
                                    color: isActive ? C.accent : C.textMuted,
                                    fontWeight: isActive ? 600 : 500,
                                    transition: "all 0.2s ease"
                                }}>
                            <div style={{ marginRight: "14px", display: "flex", alignItems: "center" }}>
                                {menu.icon}
                            </div>
                            <span style={{ fontSize: "14px" }}>{menu.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* 3. 하단 로그아웃 버튼 (고정) */}
            <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.border}` }}>
                <button onClick= {handleLogout}
                        style={{
                            display: "flex", alignItems: "center", width: "100%", padding: "12px 16px", background: "transparent",
                            color: C.textFaint, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = C.danger}
                        onMouseLeave={(e) => e.currentTarget.style.color = C.textFaint}
                >
                    <div style={{ marginRight: "14px", display: "flex", alignItems: "center" }}><Icons.Logout /></div>
                    <span style={{ fontSize: "14px" }}>로그아웃</span>
                </button>
            </div>

        </aside>
    );
}