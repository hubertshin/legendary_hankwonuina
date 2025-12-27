# 한권의나 (1Book1Me)

음성 녹음으로 쉽게 만드는 나만의 자서전. AI가 당신의 이야기를 아름다운 책으로 만들어드립니다.

## 기능

- **음성 녹음/업로드**: 브라우저에서 직접 녹음하거나 기존 음성 파일 업로드 (최대 3개)
- **가이드 질문**: 어린 시절 이야기를 위한 체계적인 질문 체크리스트
- **AI 자서전 생성**: OpenAI Whisper(STT) + GPT-4o를 활용한 자동 자서전 작성
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

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd hankwon-uina

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요

# 데이터베이스 마이그레이션
npm run db:push

# 시드 데이터 (선택사항)
npm run db:seed
```

### 개발 서버 실행

```bash
# Next.js 개발 서버
npm run dev

# 워커 (별도 터미널)
npm run worker:dev
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
│   └── schema.prisma      # 데이터베이스 스키마
├── public/
│   └── audio/             # 샘플 오디오 파일
├── src/
│   ├── app/               # Next.js App Router 페이지
│   │   ├── (auth)/        # 인증 관련 페이지
│   │   ├── (dashboard)/   # 대시보드 페이지
│   │   └── api/           # API 라우트
│   ├── components/        # React 컴포넌트
│   │   ├── recording/     # 녹음 관련 컴포넌트
│   │   └── ui/            # UI 컴포넌트
│   ├── lib/               # 유틸리티 및 설정
│   ├── workers/           # BullMQ 워커
│   └── types/             # TypeScript 타입
└── ...
```

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

## 라이선스

MIT License
