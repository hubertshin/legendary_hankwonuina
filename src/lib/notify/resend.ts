import { buildEmailBody, buildEmailSubject } from "./compose";
import type { BookingNotification, NotifyChannel } from "./types";

/**
 * Resend를 통한 메일 발송.
 *
 * Gmail SMTP 대신 쓰는 경로다. Gmail은 앱 비밀번호를 요구하는데, 그러려면
 * 2단계 인증을 먼저 켜야 하고 계정 정책에 따라 아예 발급이 막히기도 한다
 * ("The setting you are looking for is not available for your account").
 *
 * Resend는 가입 후 API 키 하나면 끝이고, **받는 사람이 가입 계정과 같으면
 * 도메인 인증도 필요 없다.** 운영자 알림은 정확히 그 경우다.
 *
 * SDK를 쓰지 않고 fetch로 호출한다. 의존성 하나를 아끼고, 요청 형태가
 * 단순해 직접 다루는 편이 오히려 명확하다.
 */

const RECIPIENTS = (process.env.ADMIN_NOTIFY_EMAIL ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

/**
 * 발신 주소.
 *
 * 도메인을 인증하지 않았다면 `onboarding@resend.dev`만 쓸 수 있다.
 * `1book1me.com`을 Resend에 등록하면 `noreply@1book1me.com` 같은 주소로 바꿀 수 있다.
 */
const FROM = process.env.RESEND_FROM ?? "한권의나 <onboarding@resend.dev>";

export const resendChannel: NotifyChannel = {
  name: "resend",

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && RECIPIENTS.length > 0);
  },

  async send(notification: BookingNotification): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: RECIPIENTS,
        subject: buildEmailSubject(notification),
        text: buildEmailBody(notification).text,
        html: buildEmailBody(notification).html,
      }),
    });

    if (!response.ok) {
      // 응답 본문에 원인이 담겨 있다. 로그에 남겨야 무엇이 문제인지 알 수 있다.
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
    }
  },
};
