package com.project.dicom_ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class BackendApplication {

	static {
		try {
			// 프로젝트 루트 기준 libs 폴더 안의 dll 절대 경로를 가져옵니다.
			String dllPath = new File("backend/libs/opencv_java.dll").getAbsolutePath();
			System.load(dllPath);
			System.out.println("====== [성공] OpenCV Native Library (.dll) 로드 완료 ======");
		} catch (UnsatisfiedLinkError e) {
			System.err.println("OpenCV Native Library 로드 실패: " + e.getMessage());
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}
