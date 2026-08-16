# 데이터베이스 마이그레이션

> **왜 `prisma/migrations/`가 아닌가**: 그 경로는 `.gitignore`에 있습니다(초기 커밋부터).
> 이 프로젝트는 `prisma migrate`를 쓰지 않으므로 손으로 쓴 SQL은 여기에 둡니다.

이 프로젝트는 `prisma migrate`가 아니라 **`prisma db push`** 방식을 씁니다. 그래서 Prisma가 관리하는 마이그레이션 이력이 없고, 스키마를 바꿔도 자동으로 적용되는 경로가 없습니다.

## ⚠️ 배포한다고 DB가 바뀌지 않습니다

`package.json`의 빌드 스크립트를 보면 이유가 분명합니다.

```json
"build":        "prisma generate && next build"
"vercel-build": "prisma generate && next build"
```

`prisma generate`는 **타입만 만들고 DB는 건드리지 않습니다.** 코드는 새 컬럼을 참조하는데 DB에 그 컬럼이 없으면 이렇게 터집니다.

```
PrismaClientKnownRequestError (P2022)
The column `Submission.preferredSlotAt` does not exist in the current database.
```

**스키마를 바꾼 배포에서는 대상 DB에 아래 절차를 직접 실행해야 합니다.**

## 적용 방법

### 방법 1 — SQL 파일 (권장)

무엇이 바뀌는지 눈으로 확인하고 적용합니다.

```bash
psql "$DATABASE_URL" -f db/migrations/2026-08-16_booking_fields.sql
```

이 파일들은 **멱등**합니다. 여러 번 실행해도 안전하고 기존 데이터를 지우지 않습니다.

### 방법 2 — Prisma로 스키마 전체 동기화

```bash
DATABASE_URL="..." npx prisma db push
```

간편하지만 `schema.prisma`와 DB의 **모든** 차이를 반영합니다. 의도치 않은 컬럼 삭제가 일어날 수 있으니, 운영 DB에는 `--preview-feature` 없이 실행하기 전 `npx prisma db push --dry-run`으로 먼저 확인하세요.

## 적용 순서

환경마다 **한 번씩** 실행합니다.

| 환경 | 적용 여부 |
|---|---|
| 로컬 개발 | ☐ |
| 스테이징 | ☐ |
| 운영 | ☐ |

## 마이그레이션 목록

| 파일 | 내용 | 관련 PR |
|---|---|---|
| `2026-08-16_booking_fields.sql` | 상담 예약 컬럼(`preferredSlotAt`, `anyTimeOk`, `consentPrivacyAt`) + 통화 기록(`calledAt`, `callResult`) 추가, `birthDate` 필수→선택 | #1 |

## 적용 확인

```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'Submission'
  AND column_name IN ('preferredSlotAt','anyTimeOk','consentPrivacyAt',
                      'calledAt','callResult','birthDate')
ORDER BY column_name;
```

6행이 나오고 `anyTimeOk`만 `NO`(NOT NULL)이면 정상입니다.

## 새 마이그레이션을 추가할 때

1. `schema.prisma`를 수정한다
2. `YYYY-MM-DD_설명.sql` 파일을 만든다 — `IF NOT EXISTS` 등으로 **멱등하게** 작성한다
3. 구 스키마를 복제한 테스트 DB에 실행해 **기존 데이터가 보존되는지** 확인한다
4. 위 목록 표에 추가한다
5. PR 본문에 "마이그레이션 필요"를 명시한다 — 놓치면 배포 직후 P2022로 서비스가 멈춘다
