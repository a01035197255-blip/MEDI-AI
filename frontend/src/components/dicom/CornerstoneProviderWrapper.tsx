"use client";

import dynamic from "next/dynamic";

const CornerstoneProvider = dynamic(
    () => import("./CornerstoneProvider"),
    {
        ssr: false,
    }
);


export default function CornerstoneProviderWrapper({
                                                       children,
                                                   }: {
    children: React.ReactNode;
}) {
    return (
        <CornerstoneProvider>
            {children}
        </CornerstoneProvider>
    );
}