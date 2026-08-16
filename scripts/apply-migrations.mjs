#!/usr/bin/env node
/**
 * 배포 시 DB 마이그레이션 자동 적용.
 *
 * 왜 필요한가
 * 이 프로젝트는 `prisma migrate`가 아니라 `db push` 방식이라 마이그레이션
 * 이력이 없다. 그런데 빌드는 `prisma generate`만 실행해 DB를 건드리지 않는다.
 * 그래서 **스키마를 바꾼 코드가 마이그레이션보다 먼저 배포되면 서비스가 멈춘다.**
 *
 *   PrismaClientKnownRequestError (P2022)
 *   The column `Submission.notifiedAt` does not exist in the current database.
 *
 * 실제로 이 사고가 두 번 났다. 사람이 순서를 기억하는 방식으로는 또 일어난다.
 * 배포와 마이그레이션을 한 단계로 묶어 순서를 틀릴 수 없게 만든다.
 *
 * 왜 `prisma db push`가 아닌가
 * `db push`는 schema.prisma와 DB의 모든 차이를 반영한다. 드리프트가 있으면
 * **컬럼을 지울 수 있다.** 운영 DB에 자동으로 돌리기엔 위험하다.
 * 여기서는 손으로 검토한 멱등 SQL만 순서대로 실행하므로, 파일에 적힌 것 외에는
 * 아무 일도 일어나지 않는다.
 *
 * 안전장치
 * - 모든 SQL은 IF NOT EXISTS 등으로 멱등하게 작성한다 (재실행해도 무해)
 * - 파일명 사전순으로 실행한다 (YYYY-MM-DD_ 접두 규칙)
 * - 하나라도 실패하면 빌드를 중단한다. 깨진 스키마로 배포하는 것보다 낫다
 * - DATABASE_URL이 없으면 건너뛴다 (DB 없이 빌드만 하는 환경 대응)
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

function log(message) {
  console.log(`[migrate] ${message}`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    log("DATABASE_URL이 없어 건너뜁니다.");
    return;
  }

  let files;
  try {
    files = readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith(".sql"))
      .sort();
  } catch {
    log("마이그레이션 디렉터리가 없어 건너뜁니다.");
    return;
  }

  if (files.length === 0) {
    log("적용할 마이그레이션이 없습니다.");
    return;
  }

  // SSL은 연결 문자열의 sslmode에 맡긴다.
  //
  // 무조건 켜면 SSL을 지원하지 않는 로컬 Postgres에서 실패하고("The server does
  // not support SSL connections"), 무조건 끄면 Neon 같은 관리형 DB가 거부한다.
  // Neon의 연결 문자열에는 이미 sslmode=require가 들어 있으므로 그걸 따르면 된다.
  //
  // rejectUnauthorized를 false로 두는 것은 관리형 DB가 흔히 쓰는 중간 인증서
  // 체인을 Node 기본 신뢰 저장소가 모르는 경우가 있어서다.
  const needsSsl = /sslmode=(require|verify-ca|verify-full)/.test(url);
  const client = new pg.Client({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  log(`${files.length}개 파일을 확인합니다.`);

  try {
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      const started = Date.now();
      await client.query(sql);
      log(`✓ ${file} (${Date.now() - started}ms)`);
    }
    log("완료.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  // 스키마가 어긋난 채 배포하면 첫 요청부터 P2022로 죽는다.
  // 빌드를 실패시켜 잘못된 배포가 나가지 않게 한다.
  console.error("[migrate] 실패 — 배포를 중단합니다.");
  console.error(error?.message ?? error);
  process.exit(1);
});
