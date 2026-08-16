-- 알림 발송 상태 컬럼 추가
--
-- 배경: 운영자 알림이 조용히 실패해도 아무도 알 수 없었다. Resend API 키가
-- 무효화된 동안 신청 두 건(강민영·강고고)의 알림이 유실됐고, 고객이 알려주기
-- 전까지 확인되지 않았다.
--
-- 발송 결과를 기록해 admin 목록에서 실패한 건을 볼 수 있게 하고, 재발송할 수
-- 있게 한다.
--
-- 실행 방법
--   psql "$DATABASE_URL" -f db/migrations/2026-08-16_notify_status.sql
--
-- 멱등하다. 여러 번 실행해도 안전하고 기존 데이터를 지우지 않는다.

BEGIN;

-- 발송 시각. NULL이면 아직 못 보냈다는 뜻이다.
-- 기존 행은 모두 NULL이 되어 "미발송"으로 표시된다. 실제로 그 시점에는
-- 알림 기능이 없었으므로 맞는 표현이다.
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "notifiedAt" TIMESTAMP(3);

-- 실패 사유. 원인을 모르면 고칠 수 없다.
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "notifyError" TEXT;

COMMIT;

-- 적용 확인
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name='Submission' AND column_name IN ('notifiedAt','notifyError');
