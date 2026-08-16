-- 상담 불가 시간(SlotBlock) 테이블 추가
--
-- 운영 시간 안이지만 그날 그 시각만 비워야 할 때 쓴다(외부 일정, 휴가 등).
-- 요일 단위 운영 시간이나 공휴일과 달리 한 슬롯 단위로 막는다.
--
-- 멱등하다. 여러 번 실행해도 안전하다.

BEGIN;

CREATE TABLE IF NOT EXISTS "SlotBlock" (
  "id"        TEXT PRIMARY KEY,
  -- 슬롯 하나가 곧 한 행이므로 중복을 막는다.
  "startAt"   TIMESTAMP(3) NOT NULL UNIQUE,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SlotBlock_startAt_idx" ON "SlotBlock"("startAt");

COMMIT;
