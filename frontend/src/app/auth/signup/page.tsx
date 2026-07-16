"use client";

import Link from "next/link";
import {
    Activity,
    BrainCircuit,
    HeartPulse,
    Lock,
    Mail,
    Phone,
    Scan,
    ShieldCheck,
    User,
} from "lucide-react";
import { AuthApi } from "@/services/Auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

function Field({
   label,
   placeholder,
   type = "text",
   icon: Icon,
   value,
   onChange,
               }: {
    label: string;
    placeholder: string;
    type?: string;
    icon: any;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-200">{label}</span>
            <div className="mt-2 flex h-10 items-center rounded-md border border-slate-700/80 bg-[#081522] px-3 shadow-inner shadow-black/30 focus-within:border-blue-400/70">
                <Icon className="mr-2 h-4 w-4 text-slate-500" />
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
            </div>
        </label>
    );
}

function MedicalVisual() {
    const nodes = [
        { icon:  Scan, className: "left-2 top-10" },
        { icon: BrainCircuit, className: "right-3 top-9" },
        { icon: HeartPulse, className: "bottom-8 left-4" },
        { icon: ShieldCheck, className: "bottom-8 right-4" },
    ];

    return (
        <div className="relative mx-auto h-[290px] w-[290px]">
            <div className="absolute inset-3 rounded-full border border-blue-400/10 bg-blue-500/[0.03]" />
            <div className="absolute inset-8 rotate-45 rounded-[34px] border border-dashed border-blue-400/25" />
            <div className="absolute inset-14 rounded-full border border-cyan-400/20" />
            <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-blue-400/30 bg-blue-500/10 shadow-[0_0_55px_rgba(59,130,246,0.3)]" />
            <div className="absolute left-1/2 top-1/2 h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl bg-gradient-to-br from-cyan-400/40 to-blue-600/30" />
            <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#16334d] text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.38)]">
                <Activity className="h-7 w-7" />
            </div>

            {nodes.map((node, index) => {
                const Icon = node.icon;
                return (
                    <div
                        key={index}
                        className={`absolute ${node.className} flex h-[68px] w-[68px] items-center justify-center rounded-lg border border-white/8 bg-[#142538] text-blue-300 shadow-2xl shadow-black/35`}
                    >
                        <Icon className="h-7 w-7" />
                    </div>
                );
            })}
        </div>
    );
}

export default function SignupPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const router = useRouter();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다");
            return;
        }

        try {
            await AuthApi.register({
                name,
                email,
                password,
                phone,
            });

            alert("회원가입 성공");
            router.push("/auth/login");
        } catch (err) {
            alert("회원가입 실패");
            console.error(err);
        }
    };
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#06111c] px-5 py-10 text-slate-100 sm:px-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.2),rgba(8,20,35,0.88)),radial-gradient(circle_at_21%_18%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(6,182,212,0.16),transparent_28%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <section className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
                <div className="grid w-full max-w-[900px] overflow-hidden rounded-lg border border-white/6 bg-[#122234]/92 shadow-2xl shadow-black/45 backdrop-blur-xl md:grid-cols-[1.02fr_0.98fr]">
                    <div className="p-8 sm:p-9">
                        <Logo />
                        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">회원가입</h1>

                        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                            <Field label="이름" placeholder="이름 입력" icon={User} value={name}
                                   onChange={(e) => setName(e.target.value)} />
                            <Field label="이메일 주소" placeholder="예, example@email.com" type="email" icon={Mail} value={email}
                                   onChange={(e) => setEmail(e.target.value)} />
                            <Field label="비밀번호" placeholder="비밀번호" type="password" icon={Lock} value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                            />
                            <Field label="비밀번호 확인" placeholder="비밀번호 확인" type="password" icon={Lock} value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)} />
                            <Field label="전화번호" placeholder="전화번호" type="tel" icon={Phone} value={phone}
                                   onChange={(e) => setPhone(e.target.value)} />

                            <button
                                type="submit"
                                className="h-11 w-full rounded-md bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                            >
                                회원가입 완료
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-slate-400">
                            이미 계정이 있으신가요?{" "}
                            <Link href="/auth/login" className="font-semibold text-blue-400 transition hover:text-cyan-300">
                                로그인
                            </Link>
                        </p>
                    </div>

                    <aside className="flex min-h-[520px] flex-col items-center justify-center border-l border-slate-900/80 bg-[#0d1a2a]/75 p-8 text-center max-md:hidden">
                        <MedicalVisual />
                        <p className="mt-8 max-w-[260px] text-sm font-medium leading-7 text-slate-100">
                            MEDI AI에서 의료 데이터를 안전하게 관리하고 AI 진단 시스템을 경험하세요.
                        </p>
                    </aside>
                </div>
            </section>
        </main>
    );
}
