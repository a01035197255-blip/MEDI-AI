package com.project.dicom_ai.onnx.config; // 본인의 config 패키지 경로에 맞게 수정

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync // 비동기 기능을 활성화합니다.
public class AsyncConfig {

    @Bean(name = "aiTaskExecutor")
    public ThreadPoolTaskExecutor aiTaskExecutor() { // 👈 중요: 반환 타입을 Executor가 아니라 ThreadPoolTaskExecutor로 명시!
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 의료 AI 연산은 CPU 집약적이므로 스레드 개수를 서버 코어 수에 맞게 타이트하게 조절합니다.
        int processors = Runtime.getRuntime().availableProcessors();

        executor.setCorePoolSize(processors);     // 기본 유지 스레드 수
        executor.setMaxPoolSize(processors * 2); // 최대 확장 스레드 수
        executor.setQueueCapacity(50);           // 대기 큐 크기
        executor.setThreadNamePrefix("AI-Task-"); // 로그에 찍힐 스레드 이름 접두사

        // ONNX 및 메모리 누수를 방지하기 위해 애플리케이션 종료 시 안전하게 스레드 종료 대기
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);

        executor.initialize();
        return executor;
    }
}