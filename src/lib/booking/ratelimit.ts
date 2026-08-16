/**
 * 요청 제한.
 *
 * 예약 API는 인증이 없는 공개 엔드포인트이고, 한 번 호출할 때마다 슬롯을
 * 점유한다. 막지 않으면 스크립트 하나로 전체 슬롯을 선점해 실제 고객이
 * 신청할 수 없게 만들 수 있다.
 *
 * 한계: 인스턴스 메모리 기반이라 여러 인스턴스로 확장하면 인스턴스별로
 * 카운트된다. 트래픽이 늘면 Redis 등 공유 저장소로 옮겨야 한다.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** 버킷이 무한히 쌓이지 않도록 주기적으로 만료분을 걷어낸다. */
const SWEEP_THRESHOLD = 5_000;

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

/**
 * 예약 **시도** 한도. 폼 입력 실수로 검증 오류를 몇 번 받는 것은 정상이므로
 * 넉넉하게 둔다. 이 값을 조이면 오타 세 번에 정상 사용자가 잠긴다.
 */
export const SUBMIT_ATTEMPT_RULE: RateLimitRule = { limit: 20, windowMs: 10 * 60_000 };

/**
 * 예약 **성공** 한도. 실제로 슬롯을 점유하는 것만 센다. 가족 여러 명이 한
 * 회선에서 신청하는 경우를 감안해 3건으로 둔다.
 */
export const SUBMIT_SUCCESS_RULE: RateLimitRule = { limit: 3, windowMs: 10 * 60_000 };

/**
 * **전역** 한도 — IP 판정이 뚫려도 피해를 묶어두는 최후 방어선.
 *
 * IP 기반 제한은 헤더 위조나 봇넷으로 우회될 수 있다. 이 서비스의 실제 신청은
 * 분당 한 자릿수를 넘지 않으므로, 전체 생성량에 상한을 두면 우회에 성공하더라도
 * 슬롯 전체를 쓸어가지 못한다.
 */
export const SUBMIT_GLOBAL_RULE: RateLimitRule = { limit: 10, windowMs: 60_000 };
export const GLOBAL_KEY = "global:submit";

/** 슬롯 조회 등 읽기성 요청 */
export const READ_RULE: RateLimitRule = { limit: 60, windowMs: 60_000 };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function sweep(now: number): void {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  now = Date.now()
): RateLimitResult {
  sweep(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, remaining: rule.limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: rule.limit - existing.count, retryAfterSeconds: 0 };
}

/**
 * 카운트를 늘리지 않고 한도에 걸렸는지만 확인한다.
 *
 * "성공한 신청만 센다"를 구현하려면 저장 전에는 확인만 하고, 저장이 끝난 뒤에
 * 소비해야 한다.
 */
export function peekRateLimit(
  key: string,
  rule: RateLimitRule,
  now = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    return { allowed: true, remaining: rule.limit, retryAfterSeconds: 0 };
  }
  if (existing.count >= rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  return { allowed: true, remaining: rule.limit - existing.count, retryAfterSeconds: 0 };
}

/** 성공한 작업을 카운트에 반영한다. */
export function consumeRateLimit(key: string, rule: RateLimitRule, now = Date.now()): void {
  checkRateLimit(key, rule, now);
}

/**
 * 신뢰할 수 있는 클라이언트 IP를 찾는다.
 *
 * ⚠️ `X-Forwarded-For`의 **맨 앞 값은 클라이언트가 임의로 설정할 수 있다.**
 * 그대로 쓰면 요청마다 다른 값을 넣어 제한을 완전히 우회할 수 있다.
 *
 * 그래서 아래 순서로만 신뢰한다.
 *   1. 플랫폼이 직접 주입하는 헤더 — Vercel/Cloudflare는 클라이언트 값을 덮어쓴다
 *   2. 운영자가 프록시 홉 수를 알려준 경우, XFF의 **뒤에서** 그만큼 센 값
 *   3. 둘 다 없으면 IP를 신뢰하지 않고 공용 버킷으로 묶는다
 *
 * 3번은 제한이 과하게 걸릴 수 있지만 뚫린 제한보다는 낫다. 전역 한도가
 * 이 경우의 피해를 한 번 더 묶어준다.
 */
export function resolveClientIp(request: Request): string | null {
  const platform =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("cf-connecting-ip");
  if (platform) {
    const first = platform.split(",")[0]?.trim();
    if (first) return first;
  }

  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
  if (hops > 0) {
    const forwarded = request.headers.get("x-forwarded-for");
    const parts = forwarded?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
    if (parts.length >= hops) return parts[parts.length - hops];
  }

  return null;
}

/**
 * 제한 버킷 키. IP를 신뢰할 수 없으면 null.
 *
 * 예전에는 이 경우 모두를 `${scope}:shared` 한 버킷에 묶었는데, 그러면
 * **개인별 한도가 사이트 전체 한도가 된다.** 성공 한도 3건/10분이 전체에
 * 걸려 네 번째 신청자부터 "이미 여러 건을 신청하셨습니다"를 보게 됐다.
 *
 * 개인 식별이 불가능하면 개인별 제한은 적용하지 않고, 전역 한도
 * (SUBMIT_GLOBAL_RULE)로만 막는 것이 맞다. 전역 한도는 애초에 이런
 * 경우를 위한 방어선이다.
 */
export function clientKey(request: Request, scope: string): string | null {
  const ip = resolveClientIp(request);
  return ip ? `${scope}:${ip}` : null;
}

/** 키가 없으면(식별 불가) 통과시킨다. */
export function checkOptional(
  key: string | null,
  rule: RateLimitRule,
  now = Date.now()
): RateLimitResult {
  if (key === null) return { allowed: true, remaining: rule.limit, retryAfterSeconds: 0 };
  return checkRateLimit(key, rule, now);
}

export function peekOptional(
  key: string | null,
  rule: RateLimitRule,
  now = Date.now()
): RateLimitResult {
  if (key === null) return { allowed: true, remaining: rule.limit, retryAfterSeconds: 0 };
  return peekRateLimit(key, rule, now);
}

export function consumeOptional(
  key: string | null,
  rule: RateLimitRule,
  now = Date.now()
): void {
  if (key === null) return;
  consumeRateLimit(key, rule, now);
}

/** 테스트에서 상태를 초기화한다. */
export function resetRateLimits(): void {
  buckets.clear();
}
