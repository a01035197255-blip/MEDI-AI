"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const C = {
    bg: "#0B1120",

    surface: "#07182A",
    panel: "#122234",

    border: "#1E293B",

    accent: "#3B82F6",

    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textFaint: "#94A3B8",
};

export default function OAuthRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (!accessToken || !refreshToken) {
            router.replace("/auth/login");
            return;
        }

        try {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            setTimeout(() => {
                router.replace("/dashboard");
            }, 800);

        } catch (err) {
            console.error("OAuth redirect error:", err);
            router.replace("/auth/login");
        }
    }, [searchParams, router]);


    return (
        <div
            style={{
                minHeight: "100vh",
                background: C.bg,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: C.text,
            }}
        >
            <div
                style={{
                    width: "380px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "14px",
                    padding: "40px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
            >

                {/* AI 아이콘 */}
                <div
                    style={{
                        width: "70px",
                        height: "70px",
                        margin: "0 auto 24px",
                        borderRadius: "50%",
                        background:
                            "rgba(0,209,255,0.1)",
                        border:
                            `1px solid rgba(0,209,255,0.4)`,
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        fontSize:"30px",
                        color:C.accent,
                    }}
                >
                    AI
                </div>


                <h1
                    style={{
                        fontSize:"20px",
                        fontWeight:700,
                        marginBottom:"10px",
                    }}
                >
                    인증 완료
                </h1>


                <p
                    style={{
                        color:C.textMuted,
                        fontSize:"13px",
                        marginBottom:"28px",
                    }}
                >
                    AI Medical Analysis System
                    <br/>
                    대시보드로 이동하고 있습니다.
                </p>



                {/* 로딩 애니메이션 */}
                <div
                    style={{
                        width:"100%",
                        height:"4px",
                        background:C.panel,
                        borderRadius:"10px",
                        overflow:"hidden",
                    }}
                >
                    <div
                        style={{
                            width:"40%",
                            height:"100%",
                            background:C.accent,
                            borderRadius:"10px",
                            animation:"loading 1s infinite",
                        }}
                    />
                </div>


                <div
                    style={{
                        marginTop:"20px",
                        fontSize:"12px",
                        color:C.textFaint,
                    }}
                >
                    Secure Token Verification...
                </div>


            </div>


            <style jsx>{`
                @keyframes loading {
                    0% {
                        transform: translateX(-120%);
                    }
                    100% {
                        transform: translateX(300%);
                    }
                }
            `}</style>

        </div>
    );
}