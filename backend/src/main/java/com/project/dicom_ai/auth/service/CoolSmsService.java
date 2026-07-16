package com.project.dicom_ai.auth.service;


import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class CoolSmsService implements SmsService {

    private final DefaultMessageService messageService;

    @Value("${coolsms.sender}")
    private String sender;

    @Override
    public void sendCode(String phone, String code) {

        Message message = new Message();
        message.setFrom(sender);
        message.setTo(phone);
        message.setText("[MEDI AI] 인증번호: " + code);

        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
        } catch (Exception e) {
            throw new RuntimeException("SMS 전송 실패", e);
        }
    }
}