import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const nextConfig: NextConfig = {
    reactStrictMode: false,

    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${API_URL}/api/:path*`,
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