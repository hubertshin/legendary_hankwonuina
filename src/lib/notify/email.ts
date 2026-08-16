import nodemailer from "nodemailer";
import { buildEmailBody, buildEmailSubject } from "./compose";
import type { BookingNotification, NotifyChannel } from "./types";

/**
 * Gmail 등 SMTP를 통한 메일 발송.
 *
 * Gmail을 쓰려면 앱 비밀번호가 필요하고, 그러려면 2단계 인증을 먼저 켜야 한다.
 * 계정 정책에 따라 발급 자체가 막히는 경우가 있어(Google Workspace, 고급 보호
 * 프로그램 등) Resend 채널을 대안으로 함께 둔다.
 */

const RECIPIENTS = (process.env.ADMIN_NOTIFY_EMAIL ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

export const emailChannel: NotifyChannel = {
  name: "smtp",

  isConfigured(): boolean {
    return Boolean(
      process.env.EMAIL_SERVER_HOST &&
        process.env.EMAIL_SERVER_USER &&
        process.env.EMAIL_SERVER_PASSWORD &&
        RECIPIENTS.length > 0
    );
  },

  async send(notification: BookingNotification): Promise<void> {
    const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port,
      // 465는 암시적 TLS, 587은 STARTTLS
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const body = buildEmailBody(notification);
    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.EMAIL_SERVER_USER,
      to: RECIPIENTS.join(", "),
      subject: buildEmailSubject(notification),
      text: body.text,
      html: body.html,
    });
  },
};
