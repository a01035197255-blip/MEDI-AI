import type { Metadata } from "next";
import "./globals.css";
import CornerstoneProviderWrapper from "@/components/dicom/CornerstoneProviderWrapper";


export const metadata: Metadata = {
    title: "MEDI AI | AI Medical Viewer",
    description: "AI 기반 의료영상 PACS 뷰어 시스템",
};


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body
            suppressHydrationWarning
            style={{
                margin: 0,
                padding: 0,
                backgroundColor: "#0D1117"
            }}
        >
        <CornerstoneProviderWrapper>
            {children}
        </CornerstoneProviderWrapper>
        </body>
        </html>
    );
}