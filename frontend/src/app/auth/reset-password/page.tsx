"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/services/Auth";
import {Scan, Mail, Phone, Lock, ShieldCheck, Activity, BrainCircuit, HeartPulse} from "lucide-react";

/* ===== Logo ===== */
function Logo() {
    return (
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-wide text-white">
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]"
            >
                <circle cx="12" cy="5" r="2" />
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
                <path d="M12 7v10M6 12h12" />
            </svg>
            <span>MEDI AI</span>
        </div>
    );
}

/* ===== Left Visual (회원가입이랑 동일 재사용) ===== */
function MedicalVisual() {
    const items = [
        { icon: Scan, label: "CT", className: "left-3 top-8" },
        { icon: BrainCircuit, label: "AI", className: "right-2 top-12" },
        { icon: HeartPulse, label: "ECG", className: "bottom-9 left-6" },
        { icon: ShieldCheck, label: "SEC", className: "bottom-8 right-6" },
    ];

    return (
        <div className="relative h-[310px] w-[310px]">
            {/* OUTER RINGS */}
            <div className="absolute inset-3 rounded-full border border-blue-400/10 bg-blue-500/[0.03]" />
            <div className="absolute inset-9 rotate-45 rounded-[36px] border border-dashed border-cyan-300/25" />
            <div className="absolute inset-16 rounded-full border border-blue-300/10" />

            {/* CENTER CORE */}
            <div className="absolute left-1/2 top-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-blue-300/25 bg-[#132b42] shadow-[0_0_60px_rgba(37,99,235,0.35)]" />

            <div className="absolute left-1/2 top-1/2 h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl bg-gradient-to-br from-cyan-300/40 via-blue-500/30 to-indigo-500/20" />

            {/* CENTER ICON (DiagnosticOrb랑 동일 스타일로 맞춤) */}
            <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#173a58] text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
                <Activity className="h-7 w-7" />
            </div>

            {/* NODES (label 포함으로 통일) */}
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        className={`absolute ${item.className} flex h-[68px] w-[68px] flex-col items-center justify-center gap-1 rounded-lg border border-white/8 bg-[#13283d]/95 text-blue-200 shadow-2xl shadow-black/35`}
                    >
                        <Icon className="h-7 w-7" />
                        <span className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function ResetPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const sendCode = async () => {
        try {
            await AuthApi.sendResetCode({ phone });
            alert("인증번호 전송 완료");
            setStep(2);
        } catch {
            alert("전송 실패");
        }
    };

    const verifyCode = async () => {
        try {
            await AuthApi.verifyResetCode({ phone, code });
            alert("인증 성공");
            setStep(3);
        } catch {
            alert("인증 실패");
        }
    };

    const changePassword = async () => {
        try {
            await AuthApi.resetPassword({ phone, newPassword });
            alert("비밀번호 변경 완료");
            router.push("/auth/login");
        } catch {
            alert("변경 실패");
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#06111c] px-5 py-10 text-slate-100 sm:px-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.2),rgba(8,20,35,0.88)),radial-gradient(circle_at_20%_16%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_76%_72%,rgba(6,182,212,0.16),transparent_30%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <section className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">

                <div className="grid w-full max-w-[900px] min-h-[650px] overflow-hidden rounded-lg border border-white/6 bg-[#122234]/92 shadow-2xl backdrop-blur-xl md:grid-cols-[1.02fr_0.98fr]">

                    {/* LEFT */}
                    <div className="flex flex-col items-center p-8 sm:p-9 min-h-full">
                        <Logo />
                        <div className="mt-10">
                            <MedicalVisual />
                        </div>
                        <p className="mt-8 text-center text-sm text-slate-400 max-w-[260px]">
                            등록된 전화번호로 인증 후 안전하게 비밀번호를 재설정합니다
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex h-full flex-col justify-between p-8 sm:p-9">
                        <div>
                        <h1 className="text-2xl font-bold text-white">비밀번호 재설정</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            전화번호 인증 후 변경 가능합니다
                        </p>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="mt-6 space-y-4">
                                <label>
                                    <span className="text-sm text-slate-200">전화번호</span>
                                    <div className="mt-2 flex h-10 items-center rounded-md bg-[#081522] px-3">
                                        <Phone className="mr-2 h-4 w-4 text-slate-500" />
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="flex-1 bg-transparent text-sm outline-none"
                                            placeholder="01012345678"
                                        />
                                    </div>
                                </label>

                            <div className="mt-6">
                                <button
                                    onClick={sendCode}
                                    className="h-11 w-full rounded-md bg-blue-600 font-bold hover:bg-blue-500"
                                >
                                    인증번호 받기
                                </button>
                            </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="mt-6 space-y-4">
                                <label>
                                    <span className="text-sm text-slate-200">인증번호</span>
                                    <div className="mt-2 flex h-10 items-center rounded-md bg-[#081522] px-3">
                                        <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                        <input
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="flex-1 bg-transparent text-sm outline-none"
                                        />
                                    </div>
                                </label>
                            <div className="mt-6">
                                <button
                                    onClick={verifyCode}
                                    className="h-11 w-full rounded-md bg-blue-600 font-bold hover:bg-blue-500"
                                >
                                    인증 확인
                                </button>
                            </div>
                        </div>
                    )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="mt-6 space-y-4">
                                <label>
                                    <span className="text-sm text-slate-200">새 비밀번호</span>
                                    <div className="mt-2 flex h-10 items-center rounded-md bg-[#081522] px-3">
                                        <Lock className="mr-2 h-4 w-4 text-slate-500" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="flex-1 bg-transparent text-sm outline-none"
                                        />
                                    </div>
                                </label>
                            <div className="mt-6">
                                <button
                                    onClick={changePassword}
                                    className="h-11 w-full rounded-md bg-blue-600 font-bold hover:bg-blue-500"
                                >
                                    비밀번호 변경
                                </button>
                            </div>
                        </div>
                    )}
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-slate-500">
                                <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-blue-400" />
                                안전한 인증 시스템
                            </div>

                            <div className="mt-5 text-sm text-slate-400">
                                <Link href="/auth/login" className="text-blue-400">
                                    로그인으로 돌아가기
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}