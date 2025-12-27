# 한권의나 (1Book1Me)

음성 녹음으로 쉽게 만드는 나만의 자서전. AI가 당신의 이야기를 아름다운 책으로 만들어드립니다.

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

### 🤖 AI 자서전 생성 (기존 기능)
- **STT 변환**: OpenAI Whisper를 활용한 음성-텍스트 변환
- **AI 작성**: GPT-4o를 활용한 자동 자서전 작성
- **실시간 처리 상태**: 처리 진행률 실시간 확인
- **초안 편집**: 생성된 자서전 확인 및 섹션별 재생성
- **내보내기**: PDF, DOCX 형식으로 다운로드
- **결제 시스템**: 무료 미리보기 (2페이지) + 유료 전체 열람

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Email Magic Link, Google OAuth)
- **Storage**: AWS S3 (또는 S3 호환 서비스)
- **Queue**: Redis + BullMQ
- **AI**: OpenAI Whisper (STT), GPT-4o (분석/작성)

## 시작하기

### 필수 조건

- Node.js 18+
- PostgreSQL
- Redis
- AWS S3 버킷 (또는 S3 호환 서비스)
- OpenAI API 키

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

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# AWS S3
S3_REGION="ap-northeast-2"
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_ENDPOINT=""  # S3 호환 서비스 사용 시

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
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

#### 7단계: 워커 실행 (선택사항)

AI 자서전 생성 기능을 사용하려면 별도 터미널에서:

```bash
# Redis가 실행 중인지 확인
redis-cli ping  # PONG 응답 확인

# 워커 시작
npm run worker:dev
```

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
| `NEXTAUTH_SECRET` | NextAuth 시크릿 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿 |
| `RESEND_API_KEY` | Resend API 키 (이메일 발송) |
| `S3_REGION` | AWS S3 리전 |
| `S3_BUCKET` | S3 버킷 이름 |
| `S3_ACCESS_KEY_ID` | AWS 액세스 키 |
| `S3_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `S3_ENDPOINT` | S3 호환 서비스 엔드포인트 (선택) |
| `REDIS_URL` | Redis 연결 문자열 |
| `OPENAI_API_KEY` | OpenAI API 키 |

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
│   ├── workers/               # BullMQ 워커 (AI 처리)
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

## 비용 예상

### OpenAI API
- Whisper: $0.006/분
- GPT-4o: ~$0.03/1K 토큰

### 예상 비용 (프로젝트당)
- 10분 녹음 3개 = $0.18 (STT)
- 분석 + 작성 = ~$0.50 (GPT-4o)
- **총합**: 약 $0.68/프로젝트

### 인프라
- Vercel Pro: $20/월
- PostgreSQL (Supabase/Neon): 무료 ~ $25/월
- Redis (Upstash): 무료 ~ $10/월
- S3: 사용량 기반

## 배포

### Vercel

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 워커 배포

워커는 별도의 서버에서 실행해야 합니다:

```bash
# PM2 사용
pm2 start npm --name "worker" -- run worker

# 또는 Docker
docker build -t hankwon-worker -f Dockerfile.worker .
docker run -d hankwon-worker
```

## 팀원 체크리스트

새로 합류한 팀원이 확인해야 할 사항:

- [ ] Git 설치 확인: `git --version`
- [ ] Node.js 설치 확인: `node --version` (18 이상)
- [ ] PostgreSQL 설치 및 실행 확인
- [ ] Redis 설치 및 실행 확인 (AI 기능 사용 시)
- [ ] GitHub 리포지토리 클론 완료
- [ ] `npm install` 실행 완료
- [ ] `.env` 파일 생성 및 설정 완료 (팀장에게 받기)
- [ ] 데이터베이스 생성: `CREATE DATABASE hankwon_uina`
- [ ] `npx prisma db push` 실행 완료
- [ ] `npm run dev` 실행 및 http://localhost:3000 접속 확인
- [ ] 이벤트 랜딩 페이지 동작 확인 (녹음 테스트)
- [ ] 관리자 로그인 테스트 (admin@example.com)
- [ ] GitHub 이슈 및 프로젝트 보드 확인

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

### Redis 연결 오류
```bash
# Redis 실행 확인
redis-cli ping  # PONG 응답이 나와야 함

# macOS에서 Redis 시작
brew services start redis
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
