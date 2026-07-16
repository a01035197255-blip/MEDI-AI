"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Activity,
    BrainCircuit,
    Eye,
    EyeOff,
    HeartPulse,
    Lock,
    Mail,
    MessageCircle,
    Search,
    Scan,
    ShieldCheck,
} from "lucide-react";
import {useEffect, useState} from "react";
import { AuthApi } from "@/services/Auth";

function Logo() {
    return (
        <div className="flex items-center justify-center gap-2.5 text-lg font-bold tracking-wide text-white">
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                className="shrink-0 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]"
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

function DiagnosticOrb() {
    const items = [
        { icon: Scan, label: "CT", className: "left-3 top-8" },
        { icon: BrainCircuit, label: "AI", className: "right-2 top-12" },
        { icon: HeartPulse, label: "ECG", className: "bottom-9 left-6" },
        { icon: ShieldCheck, label: "SEC", className: "bottom-8 right-6" },
    ];

    return (
        <div className="relative h-[310px] w-[310px]">
            <div className="absolute inset-3 rounded-full border border-blue-400/10 bg-blue-500/[0.03]" />
            <div className="absolute inset-9 rotate-45 rounded-[36px] border border-dashed border-cyan-300/25" />
            <div className="absolute inset-16 rounded-full border border-blue-300/10" />
            <div className="absolute left-1/2 top-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-blue-300/25 bg-[#132b42] shadow-[0_0_60px_rgba(37,99,235,0.35)]" />
            <div className="absolute left-1/2 top-1/2 h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl bg-gradient-to-br from-cyan-300/40 via-blue-500/30 to-indigo-500/20" />
            <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#173a58] text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
                <Activity className="h-7 w-7" />
            </div>

            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        className={`absolute ${item.className} flex h-[68px] w-[68px] flex-col items-center justify-center gap-1 rounded-lg border border-white/8 bg-[#13283d]/95 text-blue-200 shadow-2xl shadow-black/35`}
                    >
                        <Icon className="h-7 w-7" />
                        <span className="text-[10px] font-bold tracking-[0.16em] text-slate-400">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");

        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await AuthApi.login({
                email,
                password,
            });

            localStorage.setItem("accessToken", res.accessToken);
            localStorage.setItem("refreshToken", res.refreshToken);

            if (rememberMe) {
                localStorage.setItem("savedEmail", email);
            } else {
                localStorage.removeItem("savedEmail");
            }

            router.push("/dashboard");
        } catch (err) {
            alert("로그인 실패");
        }
    };

    const handleGoogleLogin = () => {
        console.log("google login click");
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#06111c] px-5 py-10 text-slate-100 sm:px-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.2),rgba(8,20,35,0.88)),radial-gradient(circle_at_20%_16%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_76%_72%,rgba(6,182,212,0.16),transparent_30%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <section className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
                <div className="grid w-full max-w-[920px] items-stretch gap-8 lg:grid-cols-[1fr_390px]">
                    <aside className="hidden min-h-[560px] rounded-lg border border-white/6 bg-[#102033]/72 p-9 shadow-2xl shadow-black/35 backdrop-blur-xl lg:flex lg:flex-col">
                        <div className="flex justify-start">
                            <Logo />
                        </div>
                        <div className="flex flex-1 items-center justify-center py-6">
                            <DiagnosticOrb />
                        </div>
                        <div className="pb-1">
                            <p className="max-w-[340px] text-xl font-bold leading-8 text-white">
                                의료 영상과 환자 데이터를 하나의 안전한 AI 공간에서 확인하세요.
                            </p>
                            <p className="mt-3 max-w-[330px] text-sm leading-6 text-slate-400">
                                MEDI AI는 진단 보조, 리포트 관리, 데이터 보호 흐름을 빠르게 이어줍니다.
                            </p>
                        </div>
                    </aside>

                    <div className="rounded-lg border border-white/6 bg-[#122234]/92 p-8 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-9">
                        <Logo />

                        <h1 className="mt-7 text-center text-2xl font-bold tracking-tight text-white">로그인</h1>

                    <form
                        className="mt-7 space-y-4"
                        onSubmit={handleLogin}
                    >
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-200">이메일 주소</span>
                            <div className="mt-2 flex h-10 items-center rounded-md border border-slate-700/80 bg-[#081522] px-3 shadow-inner shadow-black/30 focus-within:border-blue-400/70">
                                <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="예, example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-200">비밀번호</span>
                            <div className="mt-2 flex h-10 items-center rounded-md border border-slate-700/80 bg-[#081522] px-3 shadow-inner shadow-black/30 focus-within:border-blue-400/70">
                                <Lock className="mr-2 h-4 w-4 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="text-slate-500 transition hover:text-slate-200"
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </label>

                        <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-700 bg-[#081522] accent-blue-500"
                                />
                                <span>아이디 기억하기</span>
                            </label>
                            <Link href="/auth/reset-password" className="text-blue-400 transition hover:text-cyan-300">
                                비밀번호를 잊으셨나요?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="mt-5 h-11 w-full rounded-md bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                        >
                            로그인
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        계정이 없으신가요?{" "}
                        <Link href="/auth/signup" className="font-semibold text-blue-400 transition hover:text-cyan-300">
                            가입하기
                        </Link>
                    </p>

                    <div className="mt-7 flex items-center gap-3 text-xs text-slate-500">
                        <span className="h-px flex-1 bg-slate-700/70" />
                        <span>또는</span>
                        <span className="h-px flex-1 bg-slate-700/70" />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4 text-center text-xs font-medium text-slate-200">
                        <button className="space-y-2 rounded-md p-2 transition hover:bg-white/5">
                            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#fee500] text-[#301d1d] shadow-lg shadow-black/25">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            <span className="block">카카오 로그인</span>
                        </button>
                        <button className="space-y-2 rounded-md p-2 transition hover:bg-white/5">
                            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-[#03c75a] text-white shadow-lg shadow-black/25">
                                <span className="text-lg font-black">N</span>
                            </span>
                            <span className="block">네이버 로그인</span>
                        </button>
                        <button onClick={handleGoogleLogin} className="space-y-2 rounded-md p-2 transition hover:bg-white/5">
                            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-900 shadow-lg shadow-black/25">
                                <Search className="h-5 w-5 text-blue-500" />
                            </span>
                            <span className="block">구글 로그인</span>
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                        <span>암호화된 의료 데이터 보호 환경</span>
                    </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
