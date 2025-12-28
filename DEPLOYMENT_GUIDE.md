# Vercel 배포 가이드

이 가이드는 필수 서비스들을 무료로 설정하는 방법을 안내합니다.

## 📋 체크리스트

- [ ] 1. PostgreSQL 데이터베이스 설정
- [ ] 2. Redis 설정
- [ ] 3. S3 스토리지 설정
- [ ] 4. Vercel 환경 변수 추가
- [ ] 5. 배포 확인

---

## 1️⃣ PostgreSQL 데이터베이스 설정 (5분)

### 방법 A: Vercel Postgres (추천 - 가장 쉬움)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `obom_autocall` 프로젝트 클릭

3. **Storage 탭 이동**
   - 상단 메뉴에서 **Storage** 클릭

4. **Postgres 데이터베이스 생성**
   - **Create Database** 버튼 클릭
   - **Postgres** 선택
   - Database Name: `obom-db` 입력
   - **Create** 클릭

5. **자동 설정 완료**
   - `DATABASE_URL` 환경 변수가 자동으로 추가됩니다
   - ✅ 완료!

**무료 티어:**
- 60시간 compute time/월
- 256MB 스토리지

### 방법 B: Neon (더 많은 무료 용량)

1. **Neon 가입**
   - https://neon.tech 접속
   - **Sign Up** 클릭

2. **프로젝트 생성**
   - **New Project** 클릭
   - Project name: `obom-autocall`
   - Region: `AWS / US East (Ohio)` 선택
   - **Create Project** 클릭

3. **Connection String 복사**
   - Dashboard에서 **Connection String** 복사
   - 예시: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

4. **Vercel 환경 변수 추가**
   - Vercel Dashboard → 프로젝트 → Settings → Environment Variables
   - Key: `DATABASE_URL`
   - Value: 복사한 Connection String 붙여넣기
   - Environment: **Production**, **Preview**, **Development** 모두 체크
   - **Save** 클릭

**무료 티어:**
- 3GB 스토리지
- 무제한 compute

---

## 2️⃣ Redis 설정 (5분)

### Upstash Redis

1. **Upstash 가입**
   - https://upstash.com 접속
   - **Sign Up** (GitHub 계정으로 가능)

2. **Redis 데이터베이스 생성**
   - **Create Database** 클릭
   - Name: `obom-redis`
   - Type: **Regional** 선택
   - Region: 가장 가까운 지역 선택 (예: `ap-northeast-2 (Seoul)`)
   - **Create** 클릭

3. **Redis URL 복사**
   - Database 페이지에서 **Copy** 버튼 클릭
   - `UPSTASH_REDIS_REST_URL` 복사
   - 예시: `rediss://default:xxxxx@xxxxx.upstash.io:6379`

4. **Vercel 환경 변수 추가**
   - Key: `REDIS_URL`
   - Value: 복사한 URL 붙여넣기
   - Environment: **Production**, **Preview**, **Development** 모두 체크
   - **Save** 클릭

**무료 티어:**
- 10,000 commands/day
- 256MB 스토리지

---

## 3️⃣ S3 스토리지 설정 (10분)

### 방법 A: Cloudflare R2 (추천 - 완전 무료)

1. **Cloudflare 가입**
   - https://dash.cloudflare.com 접속
   - **Sign Up** 클릭

2. **R2 활성화**
   - 좌측 메뉴에서 **R2** 클릭
   - **Purchase R2** 클릭 (무료지만 결제 정보 필요)
   - 카드 정보 입력 (무료 티어 내에서는 과금 없음)

3. **Bucket 생성**
   - **Create bucket** 클릭
   - Bucket name: `obom-audio`
   - Location: **Automatic** 선택
   - **Create bucket** 클릭

4. **API Token 생성**
   - **R2** → **Manage R2 API Tokens**
   - **Create API Token** 클릭
   - Token name: `obom-api-token`
   - Permissions: **Admin Read & Write**
   - **Create API Token** 클릭

5. **정보 복사**
   복사해야 할 정보:
   ```
   Access Key ID: xxxxxxxxxxxxx
   Secret Access Key: xxxxxxxxxxxxx
   Endpoint: https://xxxxx.r2.cloudflarestorage.com
   ```

6. **Vercel 환경 변수 추가**
   다음 4개의 환경 변수 추가:

   - Key: `S3_REGION`
     Value: `auto`

   - Key: `S3_BUCKET`
     Value: `obom-audio`

   - Key: `S3_ACCESS_KEY_ID`
     Value: 복사한 Access Key ID

   - Key: `S3_SECRET_ACCESS_KEY`
     Value: 복사한 Secret Access Key

   - Key: `S3_ENDPOINT`
     Value: 복사한 Endpoint URL

**무료 티어:**
- 10GB 스토리지/월
- 1M Class A operations/월
- 10M Class B operations/월

### 방법 B: AWS S3 (프리 티어 12개월)

1. **AWS 가입**
   - https://aws.amazon.com 접속
   - 프리 티어 계정 생성

2. **S3 Bucket 생성**
   - AWS Console → **S3**
   - **Create bucket**
   - Bucket name: `obom-audio-YOUR-NAME` (고유해야 함)
   - Region: `US East (N. Virginia)` 또는 가까운 지역
   - **Create bucket**

3. **IAM User 생성**
   - AWS Console → **IAM** → **Users**
   - **Add user**
   - User name: `obom-s3-user`
   - Access type: **Programmatic access** 체크
   - **Next**

4. **권한 설정**
   - **Attach existing policies directly**
   - `AmazonS3FullAccess` 검색하여 체크
   - **Next** → **Create user**

5. **Access Key 복사**
   - Access key ID 복사
   - Secret access key 복사 (한 번만 표시됨!)

6. **Vercel 환경 변수 추가**
   - Key: `S3_REGION` → Value: `us-east-1`
   - Key: `S3_BUCKET` → Value: `obom-audio-YOUR-NAME`
   - Key: `S3_ACCESS_KEY_ID` → Value: 복사한 Access Key
   - Key: `S3_SECRET_ACCESS_KEY` → Value: 복사한 Secret Key
   - Key: `S3_ENDPOINT` → Value: (비워두기)

---

## 4️⃣ Vercel 환경 변수 추가

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**

3. **추가 필수 환경 변수**

   **NEXTAUTH_URL**
   - Key: `NEXTAUTH_URL`
   - Value: 배포 후 생성된 URL (예: `https://your-project.vercel.app`)
   - 처음에는 임시 값 입력 후, 배포 후 실제 URL로 업데이트

   **NEXTAUTH_SECRET**
   - Key: `NEXTAUTH_SECRET`
   - Value: `ON99FRhw6oOGaab92zcqckrA2/ABWlD+EMM9qVrNqKk=`
   - (이미 생성된 시크릿 사용)

   **ADMIN_EMAILS**
   - Key: `ADMIN_EMAILS`
   - Value: 본인 이메일 주소 (예: `your@email.com`)

   **App Config**
   - Key: `MAX_AUDIO_SIZE_MB` → Value: `200`
   - Key: `MAX_CLIPS_PER_PROJECT` → Value: `3`
   - Key: `FREE_PREVIEW_PAGES` → Value: `2`

4. **모든 환경 변수에서 Environment 체크**
   - Production ✓
   - Preview ✓
   - Development ✓

---

## 5️⃣ 배포 및 확인

1. **배포 트리거**
   - Vercel은 GitHub push를 자동으로 감지하여 배포합니다
   - 또는 Vercel Dashboard → Deployments → **Redeploy**

2. **배포 로그 확인**
   - Deployments 탭에서 진행 상황 확인
   - Build logs에서 에러 확인

3. **데이터베이스 마이그레이션**
   배포가 완료되면 Prisma 마이그레이션이 자동으로 실행됩니다.

4. **동작 확인**
   - 배포된 URL 접속
   - 로그인 페이지 접속: `https://your-project.vercel.app/login`
   - 설정한 이메일로 로그인 시도

---

## 🎯 환경 변수 요약

최소한 필요한 환경 변수:

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=rediss://...

# S3
S3_REGION=auto
S3_BUCKET=obom-audio
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://...

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=ON99FRhw6oOGaab92zcqckrA2/ABWlD+EMM9qVrNqKk=

# Admin
ADMIN_EMAILS=your@email.com

# App Config
MAX_AUDIO_SIZE_MB=200
MAX_CLIPS_PER_PROJECT=3
FREE_PREVIEW_PAGES=2
```

---

## ❓ 문제 해결

### 배포 실패 시
1. Vercel Deployments 탭에서 에러 로그 확인
2. 환경 변수가 모두 올바르게 설정되었는지 확인
3. Redeploy 시도

### 데이터베이스 연결 실패
1. `DATABASE_URL` 형식 확인 (`postgresql://...?sslmode=require`)
2. Vercel Postgres 사용 시 자동으로 설정되었는지 확인

### Redis 연결 실패
1. `REDIS_URL` 형식 확인 (`rediss://...`)
2. Upstash 무료 티어 제한 확인

### S3 업로드 실패
1. Bucket 권한 확인
2. API Token 권한이 Read & Write인지 확인
3. Endpoint URL이 정확한지 확인

---

## 📚 참고 링크

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Docs](https://neon.tech/docs/introduction)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)

---

## ⚠️ 주의사항

### AI 기능 관련
현재 AI 기능(OpenAI API)은 설정하지 않았습니다. 다음 기능들은 작동하지 않습니다:
- 음성 파일 자동 텍스트 변환 (STT)
- AI 자서전 원고 자동 작성

나중에 AI 기능이 필요하면:
1. https://platform.openai.com 에서 API Key 발급
2. `OPENAI_API_KEY` 환경 변수 추가
3. Redeploy

### 무료 티어 제한
- Vercel Postgres: 60시간/월 (소규모 트래픽에 적합)
- Upstash Redis: 10,000 commands/day
- Cloudflare R2: 10GB 스토리지

상용 서비스로 확장 시 유료 플랜으로 업그레이드 필요합니다.
