package com.project.dicom_ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class BackendApplication {

	static {
		try {
			String os = System.getProperty("os.name").toLowerCase();

			if (os.contains("win")) {
				String dllPath = new File("backend/libs/opencv_java.dll").getAbsolutePath();
				System.load(dllPath);
				System.out.println("====== [성공] OpenCV Native Library (.dll) 로드 완료 ======");
			} else {
				System.out.println("Linux 환경입니다. OpenCV DLL 로드를 건너뜁니다.");
			}

		} catch (UnsatisfiedLinkError e) {
			System.err.println("OpenCV Native Library 로드 실패: " + e.getMessage());
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}