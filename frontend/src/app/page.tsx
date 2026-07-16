"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    ArrowRight,
    Brain,
    FileText,
    Image as ImageIcon,
    Pill,
    Shield,
    ShieldCheck,
    Sparkles,
    UploadCloud,
    Zap,
} from "lucide-react";

const services = [
    { icon: Brain, title: "Smart Diagnosis", desc: "AI-powered symptom analysis" },
    { icon: ImageIcon, title: "Radiology Assistant", desc: "Vision AI image analysis" },
    { icon: Pill, title: "Prescription Analyzer", desc: "AI-powered prescription analyzer" },
    { icon: Shield, title: "Privacy Focused", desc: "Secure health insights" },
];

const trustItems = [
    { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security." },
    { icon: Brain, title: "AI-Powered", desc: "Advanced AI analyzes medical data for more accurate results." },
    { icon: Zap, title: "Fast & Accurate", desc: "Get precise insights in seconds to support better decisions." },
];

const featureCards = [
    { icon: UploadCloud, title: "Upload DICOM", desc: "Securely upload and manage your medical images" },
    { icon: Brain, title: "AI Analysis", desc: "Advanced AI analyzes images with high accuracy" },
    { icon: FileText, title: "Smart Report", desc: "Get comprehensive AI-powered analysis reports" },
    { icon: Shield, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security" },
];

function Logo() {
    return (
        <div className="flex items-center gap-3 text-2xl font-bold tracking-wide text-white">
            <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                className="shrink-0 text-blue-400 drop-shadow-[0_0_14px_rgba(59,130,246,0.65)]"
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

function CtScanner() {
    return (
        <div className="relative mx-auto flex min-h-[420px] w-full max-w-[500px] items-center justify-center">
            <div className="absolute bottom-16 left-1/2 h-28 w-[82%] -translate-x-1/2 rounded-full border border-blue-400/45 bg-blue-500/5 shadow-[0_0_55px_rgba(37,99,235,0.28)]" />
            <div className="absolute bottom-20 left-1/2 h-16 w-[62%] -translate-x-1/2 rounded-full border border-cyan-300/35" />
            <div className="absolute bottom-[112px] left-1/2 h-20 w-px -translate-x-1/2 bg-gradient-to-t from-cyan-300 via-blue-400/70 to-transparent shadow-[0_0_26px_rgba(56,189,248,0.9)]" />
            <div className="absolute bottom-[92px] left-1/2 h-5 w-40 -translate-x-1/2 rounded-full bg-cyan-300/55 blur-xl" />

            <div className="relative z-10 w-full rounded-2xl border border-cyan-300/55 bg-[#07172a]/76 p-5 shadow-[0_0_45px_rgba(37,99,235,0.22),inset_0_0_45px_rgba(59,130,246,0.08)] backdrop-blur-xl">
                <div className="absolute left-7 top-7 h-4 w-4 border-l-2 border-t-2 border-cyan-300" />
                <div className="absolute right-7 top-7 h-4 w-4 border-r-2 border-t-2 border-cyan-300" />
                <div className="absolute bottom-7 left-7 h-4 w-4 border-b-2 border-l-2 border-cyan-300" />
                <div className="absolute bottom-7 right-7 h-4 w-4 border-b-2 border-r-2 border-cyan-300" />

                <div className="grid grid-cols-[84px_1fr_84px] gap-4">
                    <div className="space-y-3 pt-2 text-[8px] font-bold uppercase tracking-[0.18em] text-blue-400/70">
                        {["Patient ID", "Scan Mode", "Density", "Airway", "Flow Rate", "Contrast"].map((label) => (
                            <div key={label}>
                                <p>{label}</p>
                                <div className="mt-1 h-1 rounded-full bg-blue-400/25" />
                            </div>
                        ))}
                    </div>

                    <div className="relative mx-auto flex aspect-square w-full max-w-[286px] items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18)_0%,rgba(15,23,42,0.85)_62%,rgba(2,6,23,0.95)_100%)]">
                        <div className="absolute inset-2 rounded-full border border-blue-200/25" />
                        <div className="absolute inset-7 rounded-full border border-blue-300/20" />
                        <div className="absolute h-[76%] w-[92%] rounded-[48%] border border-blue-100/70 bg-[radial-gradient(circle_at_42%_48%,rgba(239,246,255,0.8)_0%,rgba(96,165,250,0.62)_8%,transparent_17%),radial-gradient(circle_at_58%_48%,rgba(239,246,255,0.78)_0%,rgba(96,165,250,0.58)_8%,transparent_17%),radial-gradient(ellipse_at_center,rgba(59,130,246,0.5)_0%,rgba(14,165,233,0.32)_38%,transparent_62%)] shadow-[0_0_42px_rgba(96,165,250,0.45)]" />
                        <div className="absolute h-[46%] w-[20%] rounded-full bg-slate-100/75 blur-[1px]" />
                        <div className="absolute left-[30%] top-[43%] h-[36%] w-[20%] rounded-full border border-cyan-200/50" />
                        <div className="absolute right-[30%] top-[43%] h-[36%] w-[20%] rounded-full border border-cyan-200/50" />
                        <div className="absolute inset-x-8 top-1/2 h-px bg-cyan-200/45" />
                        <div className="absolute inset-y-8 left-1/2 w-px bg-cyan-200/30" />
                    </div>

                    <div className="space-y-5 pt-2">
                        {[36, 52, 42, 60].map((height, index) => (
                            <div key={index} className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-2">
                                <div className="flex h-10 items-end gap-1">
                                    {[20, height, 28, 46, 18].map((bar, barIndex) => (
                                        <span
                                            key={barIndex}
                                            className="w-1.5 rounded-full bg-cyan-300/70"
                                            style={{ height: `${bar}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const router = useRouter();

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020b16] px-4 py-6 text-slate-100 sm:px-7 lg:px-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#03111f_0%,#020813_58%,#010711_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />

            <section className="relative z-10 mx-auto min-h-[calc(100vh-3rem)] max-w-[1520px] rounded-[28px] border border-white/8 bg-[#07182a]/78 px-7 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:px-11 lg:px-12">
                <header className="flex items-center justify-between">
                    <Logo />
                </header>

                <div className="grid gap-8 pt-9 lg:grid-cols-[1fr_1.22fr_0.95fr] lg:items-center">
                    <section className="space-y-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/8 px-4 py-2 text-sm font-medium text-blue-200">
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                            AI-Powered Healthcare Platform
                        </div>

                        <div>
                            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">
                                Smarter Diagnosis.
                                <br />
                                <span className="text-blue-400">Safer Care.</span>
                            </h1>
                            <p className="mt-6 max-w-[430px] text-base leading-7 text-slate-300 xl:text-lg xl:leading-8">
                                Powered by AI agents and radiology intelligence, MEDI AI brings clarity and precision to your health with advanced technology.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <button
                                onClick={() => router.push("/auth/login")}
                                className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-lg bg-blue-500 px-8 py-3.5 text-base font-bold text-white shadow-[0_14px_38px_rgba(37,99,235,0.32)] transition hover:bg-blue-400"
                            >
                                Get Started
                                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                            </button>
                            <button className="min-h-[52px] rounded-lg border border-slate-600/70 bg-slate-950/20 px-8 py-3.5 text-base font-bold text-slate-100 transition hover:border-blue-400/60 hover:bg-blue-500/10">
                                Learn More
                            </button>
                        </div>

                        <div className="grid gap-4 border-t border-white/8 pt-7 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            {trustItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <article key={item.title} className="grid grid-cols-[42px_1fr] gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/15 bg-blue-400/10 text-blue-300">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">{item.title}</h3>
                                            <p className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <CtScanner />

                    <aside className="rounded-2xl border border-white/8 bg-[#0d2136]/72 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl xl:p-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-blue-400">MEDI AI</h2>
                        <div className="mt-7 space-y-4 xl:space-y-5">
                            {services.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className={`flex gap-5 ${index !== services.length - 1 ? "border-b border-white/8 pb-5" : ""}`}
                                    >
                                        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-blue-400/10 p-4 text-cyan-300 shadow-[inset_0_0_24px_rgba(59,130,246,0.08)]">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="text-base font-bold text-white">{item.title}</h3>
                                            <p className="mt-2 max-w-[190px] text-sm leading-6 text-slate-300">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </div>

                <section className="mt-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/8 px-4 py-2 text-sm font-semibold text-white">
                        <Sparkles className="h-4 w-4 text-blue-300" />
                        Key Features
                    </div>
                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
                        Healthcare <span className="text-blue-400">Reimagined</span> with <span className="text-blue-400">AI</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-[560px] text-base leading-7 text-slate-400">
                        Advanced AI technology meets healthcare expertise to deliver more accurate diagnoses and better patient outcomes.
                    </p>

                    <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {featureCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <article
                                    key={card.title}
                                    className="group flex items-center justify-between rounded-xl border border-white/7 bg-[#0c1f34]/72 p-5 text-left shadow-xl shadow-black/20 transition hover:border-blue-400/35 hover:bg-[#112a45]/78"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                                            <Icon className="h-9 w-9" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{card.title}</h3>
                                            <p className="mt-2 max-w-[210px] text-sm leading-6 text-slate-400">{card.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 shrink-0 text-blue-400 transition group-hover:translate-x-1" />
                                </article>
                            );
                        })}
                    </div>
                </section>
            </section>
        </main>
    );
}
