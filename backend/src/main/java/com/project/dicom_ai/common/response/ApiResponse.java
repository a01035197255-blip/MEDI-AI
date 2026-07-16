package com.project.dicom_ai.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String code;
    private final String message;
    private final T data;


    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "S000", "OK", data);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<Void>(true, "S000", "OK", null);
    }

    public static ApiResponse<Void> fail(String code, String message) {
        return new ApiResponse<Void>(false, code, message, null);
    }
}