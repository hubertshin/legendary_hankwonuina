import { emailChannel } from "./email";
import type { BookingNotification, NotifyChannel } from "./types";

export type { BookingNotification, NotifyChannel };

/**
 * 등록된 알림 채널.
 *
 * 나중에 알림톡(고객 대상)이나 텔레그램(운영자 대상)을 추가하려면 여기에
 * 채널만 밀어 넣으면 된다. 호출부는 바뀌지 않는다.
 */
const CHANNELS: NotifyChannel[] = [emailChannel];

/**
 * 신청 알림을 보낸다.
 *
 * **절대 예외를 던지지 않는다.** 신청은 이미 저장된 뒤에 호출되므로, 여기서
 * 실패해 사용자에게 오류가 보이면 "저장은 됐는데 실패했다고 나오는" 최악의
 * 상황이 된다. 실패는 로그로만 남긴다.
 *
 * @returns 채널별 성공 여부. 운영 로그·모니터링에 쓴다.
 */
export async function notifyNewBooking(
  notification: BookingNotification
): Promise<{ channel: string; ok: boolean; reason?: string }[]> {
  const results = await Promise.all(
    CHANNELS.map(async (channel) => {
      if (!channel.isConfigured()) {
        // 설정이 없는 것은 오류가 아니다. 다만 알림이 안 간다는 사실은 남긴다.
        console.warn(
          `[notify] ${channel.name} 미설정 — 알림을 보내지 않습니다. ` +
            `환경변수를 확인하세요.`
        );
        return { channel: channel.name, ok: false, reason: "not_configured" };
      }

      try {
        await channel.send(notification);
        console.log(`[notify] ${channel.name} 발송 성공 (${notification.submissionId})`);
        return { channel: channel.name, ok: true };
      } catch (error) {
        // 발송 실패가 신청을 실패시켜서는 안 된다. 운영자가 admin에서
        // 신청 자체는 볼 수 있으므로 리드가 유실되지는 않는다.
        console.error(
          `[notify] ${channel.name} 발송 실패 (${notification.submissionId}):`,
          error instanceof Error ? error.message : error
        );
        return {
          channel: channel.name,
          ok: false,
          reason: error instanceof Error ? error.message : "unknown",
        };
      }
    })
  );

  return results;
}
