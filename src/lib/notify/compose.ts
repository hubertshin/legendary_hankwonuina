import type { BookingNotification } from "./types";

/**
 * 알림 메일 본문 생성.
 *
 * SMTP(Gmail)와 Resend 두 채널이 같은 내용을 보내야 하므로 여기 모았다.
 * 채널마다 문구가 갈리면 어느 쪽으로 왔는지에 따라 운영자가 보는 정보가
 * 달라진다.
 */

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://www.1book1me.com";

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

function formatSlot(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/**
 * 제목에 핵심 정보를 다 넣는다.
 *
 * 휴대폰 알림은 제목만 보이는 경우가 많다. 열어보지 않고도 "언제 누구에게
 * 전화해야 하는지" 알 수 있어야 한다.
 */
function buildSubject(n: BookingNotification): string {
  const when = n.preferredSlotAt ? formatSlot(n.preferredSlotAt) : "시간 미정";
  return `[한권의나] ${n.name}님 상담 신청 · ${when}`;
}

function buildText(n: BookingNotification): string {
  const lines = [
    "새 상담 신청이 접수됐습니다.",
    "",
    `이름      ${n.name}`,
    `연락처    ${formatPhone(n.phone)}`,
    `구분      ${n.subjectType}`,
  ];

  if (n.subjectName) lines.push(`주인공    ${n.subjectName}`);
  if (n.subjectAgeRange) lines.push(`연세      ${n.subjectAgeRange}`);

  lines.push(
    "",
    n.preferredSlotAt
      ? `희망 통화  ${formatSlot(n.preferredSlotAt)}`
      : "희망 통화  아무 때나 (배정 필요)"
  );

  if (n.question) lines.push("", `문의 내용`, n.question);

  lines.push(
    "",
    "─".repeat(40),
    `관리자에서 보기: ${SITE_URL.replace(/\/$/, "")}/admin/submissions`,
    `접수 시각: ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(n.createdAt))}`
  );

  return lines.join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(n: BookingNotification): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#888;white-space:nowrap">${label}</td>` +
    `<td style="padding:6px 0;color:#1C1C1E;font-weight:600">${value}</td></tr>`;

  const when = n.preferredSlotAt
    ? escapeHtml(formatSlot(n.preferredSlotAt))
    : '<span style="color:#B5965E">아무 때나 · 배정 필요</span>';

  return `
<div style="font-family:-apple-system,'Apple SD Gothic Neo',sans-serif;max-width:520px;margin:0 auto;padding:24px">
  <p style="margin:0 0 4px;color:#C9A84C;font-size:14px">한권의나</p>
  <h1 style="margin:0 0 20px;font-size:20px;color:#1C1C1E">새 상담 신청</h1>

  <div style="background:#F8F5EF;border-radius:12px;padding:18px;margin-bottom:18px">
    <p style="margin:0 0 4px;color:#888;font-size:13px">희망 통화 시각</p>
    <p style="margin:0;font-size:18px;font-weight:700;color:#1C1C1E">${when}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:15px">
    ${row("이름", escapeHtml(n.name))}
    ${row("연락처", `<a href="tel:${escapeHtml(n.phone)}" style="color:#1C1C1E">${escapeHtml(formatPhone(n.phone))}</a>`)}
    ${row("구분", escapeHtml(n.subjectType))}
    ${n.subjectName ? row("주인공", escapeHtml(n.subjectName)) : ""}
    ${n.subjectAgeRange ? row("연세", escapeHtml(n.subjectAgeRange)) : ""}
  </table>

  ${
    n.question
      ? `<div style="margin-top:18px;padding:14px;border-left:3px solid #C9A84C;background:#fafafa">
           <p style="margin:0 0 6px;color:#888;font-size:13px">문의 내용</p>
           <p style="margin:0;white-space:pre-wrap;color:#1C1C1E">${escapeHtml(n.question)}</p>
         </div>`
      : ""
  }

  <a href="${SITE_URL.replace(/\/$/, "")}/admin/submissions"
     style="display:inline-block;margin-top:22px;padding:12px 20px;background:#1C1C1E;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
    관리자에서 보기
  </a>
</div>`.trim();
}


/** 휴대폰 알림에 보이는 제목. */
export function buildEmailSubject(n: BookingNotification): string {
  return buildSubject(n);
}

/** 텍스트·HTML 본문을 함께 반환한다. */
export function buildEmailBody(n: BookingNotification): { text: string; html: string } {
  return { text: buildText(n), html: buildHtml(n) };
}

export const __testing = { buildSubject, buildText, formatPhone };
