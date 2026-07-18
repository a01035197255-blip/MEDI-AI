<div align="center">

# 🏥 MEDI AI

### AI 기반 의료영상(DICOM) 분석 플랫폼

> **DICOM 의료영상을 AI로 분석하여 병변 위치를 시각화하는 의료영상 분석 플랫폼**

<br>

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions)

</div>

---

# 📖 Project Description

MEDI AI는 **CT·CR DICOM 의료영상**을 AI 기반으로 분석하여 병변 위치를 시각화하는 의료영상 분석 플랫폼입니다.

사용자가 DICOM 의료영상을 업로드하면 AI가 병변을 분석하여 **Bounding Box 좌표**를 생성하고,

**Cornerstone 기반 DICOM Viewer**를 통해 병변 위치를 직관적으로 확인할 수 있습니다.

이를 통해 의료영상 분석의 **효율성과 진단 정확도를 향상**시키는 서비스를 제공합니다.

---

# 🚀 Tech Stack

| Category | Stack |
|----------|-------|
| **Frontend** | Next.js · JavaScript · Tailwind CSS · Axios |
| **Backend** | Java · Spring Boot · Spring Security · Spring Data JPA · JWT · Redis · REST API |
| **AI** | DICOM (CT·CR) · ONNX Runtime · CT·CR AI Model |
| **Viewer** | Cornerstone · Zoom · Pan · Window Level |
| **Database** | PostgreSQL |
| **AWS** | Elastic Beanstalk · Amplify |
| **CI/CD** | GitHub Actions |

---

# 📊 Service Flow

```text
DICOM ZIP Upload
        │
        ▼
Metadata 저장
        │
        ▼
PNG 이미지 변환
        │
        ▼
CT · CR AI Model
(ONNX Runtime)
        │
        ▼
Bounding Box 생성
        │
        ▼
Cornerstone DICOM Viewer
        │
        ▼
Dashboard & Statistics
```

---

# ✨ Main Features

## 🔐 Authentication

- JWT Access Token 인증
- Redis Refresh Token 관리
- Access Token 재발급
- 회원가입
- SMS(CoolSMS) 인증
- 비밀번호 재설정

---

## 👨‍⚕️ Patient Management

- Patient CRUD
- Study CRUD
- Series CRUD
- Image CRUD

---

## 📂 DICOM Upload

- DICOM ZIP Upload
- Metadata 저장
- PNG 이미지 변환

---

## 🤖 AI Medical Analysis

- CT·CR AI 분석 요청
- ONNX Runtime 추론
- Bounding Box 좌표 생성
- AI 분석 결과 저장

---

## 🩻 DICOM Viewer

### Cornerstone 기반 Viewer

✔ Zoom

✔ Pan

✔ Window Level

✔ Bounding Box Overlay

✔ AI 분석 결과 시각화

---

## 📈 Dashboard

Dashboard를 통해 전체 의료영상 분석 현황을 확인할 수 있습니다.

- 👨‍⚕️ 총 환자 수
- 📄 총 검사 수
- 🤖 AI 분석 완료 건수
- 🚨 이상 탐지 건수
- 📊 위험도(Donut Chart)
- 📈 월별 AI 분석 결과
- 📝 최근 검사 목록

---

# 🔄 Processing Flow

```text
Login
   │
   ▼
Patient 생성
   │
   ▼
Study 생성
   │
   ▼
DICOM ZIP Upload
   │
   ▼
Metadata 저장
   │
   ▼
PNG 변환
   │
   ▼
AI 분석 요청
   │
   ▼
ONNX Runtime 추론
   │
   ▼
Bounding Box 생성
   │
   ▼
Cornerstone Viewer 표시
   │
   ▼
Dashboard 통계
```

---

# 🌟 Key Features

- ✅ DICOM 의료영상 관리
- ✅ AI 기반 병변 분석
- ✅ Bounding Box 시각화
- ✅ Cornerstone DICOM Viewer
- ✅ JWT + Redis 인증 시스템
- ✅ REST API 기반 Frontend & Backend
- ✅ GitHub Actions CI/CD
- ✅ AWS Elastic Beanstalk 배포
- ✅ AWS Amplify 배포
- ✅ Dashboard 통계 제공

---

# 📚 What I Learned

- DICOM 의료영상 구조 및 Metadata 처리
- PNG 이미지 변환 및 AI 분석 파이프라인
- 의료영상 AI 분석 프로세스 이해
- PostgreSQL 데이터베이스 설계
- REST API 기반 서비스 통합
- JWT + Redis 인증 시스템 구축
- GitHub Actions CI/CD 자동 배포
- AWS 서비스 배포 경험
- 팀 프로젝트 협업 및 통합 경험

---

# 👨‍💻 Team

| Role | Description |
|------|-------------|
| 👑 Team Leader | 프로젝트 관리 및 요구사항 분석 |
| ⚙ Backend | CRUD · DICOM Upload · Metadata · PNG 변환 · AI 분석 요청 · Dashboard |
| 🎨 Frontend | Home · Login · Signup · Password Reset |
| 🔗 Integration | REST API 연동 · Cornerstone Viewer 연동 · 서비스 통합 |
| 📢 Presentation | 발표 자료 제작 및 최종 발표 |
