import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
    reactStrictMode: false,

    async rewrites() {
        return [
            {
                source: "/orthanc/:path*",
                destination: "http://localhost:8042/:path*",
            },
            {
                source: "/api/:path*",
                destination: "http://localhost:8080/api/:path*",
            },
        ];
    },

    webpack(config: Configuration) {
        config.resolve = config.resolve ?? {};

        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        };

        return config;
    },
};

export default nextConfig;