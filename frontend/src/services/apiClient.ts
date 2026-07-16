import axios from "axios";

// ==========================
// Base API Client
// ==========================
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// ==========================
// Token Utils (핵심)
// ==========================
const cleanToken = (token?: string | null) =>
    token?.replace(/^Bearer\s+/i, "").trim() || null;

// ==========================
// Request Interceptor
// ==========================
apiClient.interceptors.request.use((config) => {
    const rawToken = localStorage.getItem("accessToken");
    const token = cleanToken(rawToken);

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ==========================
// Refresh Control State
// ==========================
let isRefreshing = false;
let queue: ((token: string) => void)[] = [];

// ==========================
// Response Interceptor (Refresh Logic)
// ==========================
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // ==========================
            // 이미 refresh 중이면 큐 대기
            // ==========================
            if (isRefreshing) {
                return new Promise((resolve) => {
                    queue.push((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                // ==========================
                // Refresh Token 가져오기
                // ==========================
                let refreshToken = localStorage.getItem("refreshToken");
                refreshToken = cleanToken(refreshToken);

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // ==========================
                // Refresh API
                // ==========================
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                const rawAccessToken =
                    res.data?.accessToken ||
                    res.data?.data?.accessToken;

                const newAccessToken = cleanToken(rawAccessToken);

                if (!newAccessToken) {
                    throw new Error("Invalid access token");
                }

                // ==========================
                // 저장 (중요: "Bearer" 없이 저장)
                // ==========================
                localStorage.setItem("accessToken", newAccessToken);

                // axios 기본 헤더 업데이트
                apiClient.defaults.headers.common.Authorization =
                    `Bearer ${newAccessToken}`;

                // ==========================
                // 큐 처리
                // ==========================
                queue.forEach((cb) => cb(newAccessToken));
                queue = [];

                // ==========================
                // 원 요청 재시도
                // ==========================
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;
                }

                return apiClient(originalRequest);
            } catch (err) {
                // ==========================
                // refresh 실패 → 로그아웃
                // ==========================
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                window.location.href = "/auth/login";

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);