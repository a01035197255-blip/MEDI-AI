"use client";

import { init as coreInit } from "@cornerstonejs/core";
import { init as toolsInit } from "@cornerstonejs/tools";
import {
    init as dicomImageLoaderInit
} from "@cornerstonejs/dicom-image-loader";

import { useEffect, useState } from "react";

let started = false;

export default function CornerstoneProvider({
                                                children
                                            }: {
    children: React.ReactNode
}) {

    const [ready, setReady] = useState(false);

    useEffect(() => {

        async function initialize() {

            if (started) {
                setReady(true);
                return;
            }

            try {

                await coreInit();

                await dicomImageLoaderInit({
                    maxWebWorkers: 1,

                    beforeSend: (xhr: XMLHttpRequest) => {

                        const token =
                            localStorage.getItem("accessToken");

                        if (token) {
                            xhr.setRequestHeader(
                                "Authorization",
                                `Bearer ${token}`
                            );
                        }
                    }
                });

                await toolsInit();

                started = true;

                console.log("CORNERSTONE READY");

                setReady(true);

            } catch (e) {
                console.error(
                    "Cornerstone init failed",
                    e
                );
            }
        }

        initialize();

    }, []);

    if (!ready) {
        return <div>Loading Cornerstone...</div>;
    }

    return children;
}