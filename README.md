# 한권의나 (1Book1Me)

자서전 제1장 무료 제작 이벤트 - 음성 녹음으로 어린 시절 이야기를 남겨보세요.

## 주요 기능

### 📝 이벤트 제출 시스템 (No-Auth)
- **음성 녹음/업로드**: 브라우저에서 직접 녹음하거나 기존 음성 파일 업로드 (최대 3개)
- **가이드 질문**: 어린 시절 이야기를 위한 체계적인 질문 체크리스트 (12개)
- **신청자 정보**: 이름, 생년월일, 전화번호, 자서전 주인공 선택
- **예시 음성**: 녹음 가이드를 위한 샘플 오디오 제공
- **실시간 업로드**: S3 presigned URL을 통한 안전한 파일 업로드

### 🔐 관리자 대시보드
- **제출물 관리**: 모든 이벤트 제출물 조회 및 상태 관리
- **상세 정보**: 신청자 정보, 오디오 파일 재생, 메모 작성
- **상태 업데이트**: PENDING → CONTACTED → PROCESSING → COMPLETED
- **오디오 재생**: S3에서 직접 스트리밍하여 재생

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Credentials Provider)
- **Storage**: AWS S3 (또는 S3 호환 서비스 - MinIO)

## 시작하기

### 필수 조건

- Node.js 18+
- PostgreSQL
- AWS S3 버킷 (또는 S3 호환 서비스 - MinIO 등)

### 설치 (팀원용 가이드)

#### 1단계: 리포지토리 클론

```bash
git clone https://github.com/MYKang/obom_autocall.git
cd obom_autocall
```

#### 2단계: 의존성 설치

```bash
npm install
```

#### 3단계: 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 아래 내용을 입력하세요:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hankwon_uina"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32로 생성

# Admin Access
ADMIN_EMAILS="admin@example.com"

# AWS S3 (또는 MinIO)
S3_REGION="us-east-1"
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_ENDPOINT="http://localhost:9000"  # S3 호환 서비스(MinIO 등) 사용 시
```

**중요**: 팀장에게 `.env` 파일 내용을 별도로 받으세요 (Slack, 이메일 등으로 안전하게 공유).

#### 4단계: PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE hankwon_uina;

# 종료
\q
```

#### 5단계: 데이터베이스 마이그레이션

```bash
# Prisma 스키마를 데이터베이스에 적용
npx prisma db push

# Prisma Client 생성 확인
npx prisma generate
```

#### 6단계: 개발 서버 실행

```bash
# Next.js 개발 서버 시작
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하여 확인하세요.

### 협업 워크플로우

#### 작업 시작하기

```bash
# 최신 변경사항 가져오기
git pull origin main

# 새 브랜치 생성 (기능별)
git checkout -b feature/your-feature-name
# 또는 버그 수정: git checkout -b fix/bug-description
```

#### 작업 및 커밋

```bash
# 변경사항 확인
git status

# 파일 스테이징
git add .

# 커밋 (의미있는 메시지 작성)
git commit -m "Add feature: description of changes"
```

#### Pull Request 생성

```bash
# 원격 저장소에 푸시
git push origin feature/your-feature-name

# GitHub에서 Pull Request 생성
# 1. https://github.com/MYKang/obom_autocall 접속
# 2. "Compare & pull request" 버튼 클릭
# 3. 변경사항 설명 작성
# 4. 리뷰어 지정
# 5. "Create pull request" 클릭
```

#### 코드 리뷰 후 머지

```bash
# main 브랜치로 돌아가기
git checkout main

# 최신 변경사항 가져오기
git pull origin main

# 작업 브랜치 삭제 (선택사항)
git branch -d feature/your-feature-name
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `NEXTAUTH_URL` | 앱 URL (예: http://localhost:3000) |
| `NEXTAUTH_SECRET` | NextAuth 시크릿 키 (openssl rand -base64 32) |
| `ADMIN_EMAILS` | 관리자 이메일 주소 (쉼표로 구분) |
| `S3_REGION` | AWS S3 리전 또는 us-east-1 (MinIO) |
| `S3_BUCKET` | S3 버킷 이름 |
| `S3_ACCESS_KEY_ID` | AWS 액세스 키 또는 MinIO 액세스 키 |
| `S3_SECRET_ACCESS_KEY` | AWS 시크릿 키 또는 MinIO 시크릿 키 |
| `S3_ENDPOINT` | S3 호환 서비스 엔드포인트 (MinIO: http://localhost:9000) |

## 프로젝트 구조

```
├── prisma/
│   └── schema.prisma          # 데이터베이스 스키마 (User, Project, AudioClip, Submission 등)
├── public/
│   └── audio/
│       └── example.m4a        # 녹음 가이드 예시 음성
├── src/
│   ├── app/
│   │   ├── page.tsx           # 이벤트 랜딩 페이지 (No-Auth)
│   │   ├── (auth)/
│   │   │   └── login/         # 관리자 로그인 페이지
│   │   ├── (dashboard)/
│   │   │   └── admin/
│   │   │       └── submissions/  # 관리자 - 제출물 관리
│   │   └── api/
│   │       ├── event/         # 이벤트 API (presign, confirm, submit)
│   │       └── admin/         # 관리자 API (submissions, audio)
│   ├── components/
│   │   ├── recording/         # 오디오 녹음/업로드 컴포넌트
│   │   ├── event/             # 이벤트 관련 컴포넌트
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── auth.ts            # NextAuth 설정
│   │   ├── s3.ts              # AWS S3 유틸리티
│   │   ├── validations.ts     # Zod 스키마
│   │   └── event-utils.ts     # 이벤트 유틸리티
│   └── types/                 # TypeScript 타입
└── ...
```

## 주요 페이지

| URL | 설명 | 인증 |
|-----|------|------|
| `/` | 이벤트 랜딩 페이지 - 음성 녹음 및 제출 | ❌ 불필요 |
| `/login` | 관리자 로그인 | ❌ 불필요 |
| `/admin/submissions` | 제출물 목록 관리 | ✅ 필요 |
| `/admin/submissions/[id]` | 제출물 상세 정보 | ✅ 필요 |

## 관리자 로그인

개발 환경에서 관리자로 로그인하려면:

```
Email: admin@example.com
```

로그인 후 `/admin/submissions`에서 모든 이벤트 제출물을 관리할 수 있습니다.

## 팀원 체크리스트

새로 합류한 팀원이 확인해야 할 사항:

- [ ] Git 설치 확인: `git --version`
- [ ] Node.js 설치 확인: `node --version` (18 이상)
- [ ] PostgreSQL 설치 및 실행 확인
- [ ] GitHub 리포지토리 클론 완료
- [ ] `npm install` 실행 완료
- [ ] `.env` 파일 생성 및 설정 완료 (팀장에게 받기)
- [ ] 데이터베이스 생성: `CREATE DATABASE hankwon_uina`
- [ ] `npx prisma db push` 실행 완료
- [ ] `npm run dev` 실행 및 http://localhost:3000 접속 확인
- [ ] 이벤트 랜딩 페이지 동작 확인 (녹음 테스트)
- [ ] 관리자 로그인 테스트 (admin@example.com)
- [ ] `/admin/submissions` 페이지 접속 확인

## 문제 해결

### 포트 충돌 (3000 already in use)
```bash
# 포트를 사용 중인 프로세스 찾기
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)
```

### Prisma Client 오류
```bash
# Prisma Client 재생성
npx prisma generate
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 실행 확인
pg_isready

# 또는
brew services list | grep postgresql
```

## 팀 협업 규칙

1. **브랜치 전략**
   - `main`: 프로덕션 코드
   - `feature/*`: 새 기능 개발
   - `fix/*`: 버그 수정
   - `refactor/*`: 리팩토링

2. **커밋 메시지**
   - `Add`: 새 기능 추가
   - `Fix`: 버그 수정
   - `Update`: 기존 기능 수정
   - `Refactor`: 코드 리팩토링
   - `Docs`: 문서 수정

3. **Pull Request**
   - 최소 1명의 리뷰어 승인 필요
   - 모든 테스트 통과 확인
   - 충돌(conflict) 해결 후 머지

## 라이선스

MIT License
