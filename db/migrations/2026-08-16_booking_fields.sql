-- 상담 예약 기능에 필요한 Submission 컬럼 추가
--
-- 적용 대상: 상담 예약(PR #1) 이전에 만들어진 모든 데이터베이스
--
-- 이 프로젝트는 `prisma migrate`가 아니라 `prisma db push` 방식이라 마이그레이션
-- 이력이 남지 않는다. 그런데 `npm run build`는 `prisma generate`만 실행하므로
-- **배포한다고 해서 DB 스키마가 바뀌지 않는다.** 코드만 새 컬럼을 참조하게 되어
-- 다음 오류가 난다.
--
--   PrismaClientKnownRequestError (P2022)
--   The column `Submission.preferredSlotAt` does not exist in the current database.
--
-- 그래서 각 환경의 DB에 이 파일을 한 번 실행해야 한다.
--
-- 실행 방법
--   psql "$DATABASE_URL" -f db/migrations/2026-08-16_booking_fields.sql
--
-- 또는 Prisma로 스키마 전체를 맞추는 방법 (동등한 결과)
--   DATABASE_URL="..." npx prisma db push
--
-- 이 스크립트는 멱등하다. 여러 번 실행해도 안전하고, 기존 데이터를 지우지 않는다.

BEGIN;

-- ── 1. 통화 결과 enum ────────────────────────────────────────────────────
-- CREATE TYPE에는 IF NOT EXISTS가 없어 예외로 처리한다.
DO $$
BEGIN
  CREATE TYPE "CallResult" AS ENUM ('CONNECTED', 'NO_ANSWER', 'CALLBACK_REQUESTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- ── 2. 예약 컬럼 (PR #1: 전화 상담 예약) ─────────────────────────────────
-- preferredSlotAt: 희망 통화 시각. anyTimeOk가 true면 NULL이며 운영자가 배정한다.
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "preferredSlotAt" TIMESTAMP(3);

-- anyTimeOk: "아무 때나 괜찮아요". 기존 행은 시간을 고른 적이 없으므로 false가 맞다.
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "anyTimeOk" BOOLEAN NOT NULL DEFAULT false;

-- consentPrivacyAt: 개인정보 수집·이용 동의 시각 (법적 증빙).
-- 기존 행은 이 흐름을 거치지 않았으므로 NULL로 남는다.
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "consentPrivacyAt" TIMESTAMP(3);

-- ── 3. 통화 기록 컬럼 (PR #1: admin 통화 기록) ───────────────────────────
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "calledAt" TIMESTAMP(3);
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "callResult" "CallResult";

-- ── 4. birthDate 필수 → 선택 ────────────────────────────────────────────
-- 상담 예약 흐름에서는 생년월일을 받지 않는다. 기존 데이터는 그대로 유지된다.
ALTER TABLE "Submission" ALTER COLUMN "birthDate" DROP NOT NULL;

-- ── 5. 인덱스 ───────────────────────────────────────────────────────────
-- 슬롯 정원 확인과 admin 정렬이 이 컬럼으로 조회한다.
CREATE INDEX IF NOT EXISTS "Submission_preferredSlotAt_idx"
  ON "Submission"("preferredSlotAt");

COMMIT;

-- ── 적용 확인 ───────────────────────────────────────────────────────────
-- 아래 쿼리가 6행을 반환하면 정상이다.
--
--   SELECT column_name, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'Submission'
--     AND column_name IN ('preferredSlotAt','anyTimeOk','consentPrivacyAt',
--                         'calledAt','callResult','birthDate')
--   ORDER BY column_name;
