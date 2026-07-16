import { apiClient } from './apiClient';

// ===================================================================
// 🧱 ApiResponse
// ===================================================================
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

// ===================================================================
// 🧱 Auth DTO
// ===================================================================
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

// ===================================================================
// 📱 Password Reset DTO
// ===================================================================
export interface PhoneRequest {
    phone: string;
}

export interface VerifyCodeRequest {
    phone: string;
    code: string;
}

export interface ResetPasswordRequest {
    phone: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ===================================================================
// 🔐 OAuth URL
// ===================================================================
export const OAuth2Urls = {
    google: `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`,
};

// ===================================================================
// 🚀 Auth API
// ===================================================================
export const AuthApi = {

    // =====================
    // 1. 회원가입
    // =====================
    register: async (data: RegisterRequest): Promise<void> => {
        const res = await apiClient.post<ApiResponse<void>>(
            '/api/auth/register',
            data
        );
        return res.data.data;
    },

    // =====================
    // 2. 로그인
    // =====================
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await apiClient.post<ApiResponse<LoginResponse>>(
            '/api/auth/login',
            data,
            { withCredentials: true }
        );
        return res.data.data;
    },

    // =====================
    // 3. 로그아웃
    // =====================
    logout: async (): Promise<void> => {
        const res = await apiClient.post<ApiResponse<void>>(
            '/api/auth/logout'
        );
        return res.data.data;
    },

    // =====================
    // 4. 비밀번호 재설정 - 코드 발송
    // =====================
    sendResetCode: async (data: PhoneRequest): Promise<void> => {
        const res = await apiClient.post<ApiResponse<void>>(
            '/api/auth/password/reset/send',
            data
        );
        return res.data.data;
    },

    // =====================
    // 5. 비밀번호 재설정 - 코드 검증
    // =====================
    verifyResetCode: async (data: VerifyCodeRequest): Promise<void> => {
        const res = await apiClient.post<ApiResponse<void>>(
            '/api/auth/password/reset/verify',
            data
        );
        return res.data.data;
    },

    // =====================
    // 6. 비밀번호 재설정 - 최종 변경
    // =====================
    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        const res = await apiClient.post<ApiResponse<void>>(
            '/api/auth/password/reset',
            data
        );
        return res.data.data;
    },

    changePassword: async (
        data: ChangePasswordRequest
    ): Promise<void> => {

        const res = await apiClient.patch<ApiResponse<void>>(
            '/api/auth/password',
            data
        );

        return res.data.data;
    }
};