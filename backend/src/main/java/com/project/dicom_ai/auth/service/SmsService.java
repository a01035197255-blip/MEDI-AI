package com.project.dicom_ai.auth.service;

public interface SmsService {
    void sendCode(String phone, String code);
}