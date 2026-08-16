/**
 * 신청 알림.
 *
 * 지금은 운영자에게 이메일만 보낸다. 나중에 알림톡(고객 대상)을 붙일 때
 * 발송 수단만 추가하면 되도록 어댑터로 분리했다.
 *
 * 핵심 원칙: **알림 실패가 신청 저장을 실패시켜서는 안 된다.** 신청은 이미
 * 저장됐는데 메일 서버가 죽었다고 사용자에게 오류를 보여주면 더 나쁘다.
 * 실패는 로그로 남겨 운영자가 admin에서 확인할 수 있게 한다.
 */

export interface BookingNotification {
  submissionId: string;
  name: string;
  /** 숫자만 저장된 값 (예: "01012345678") */
  phone: string;
  /** "본인" | "부모님" 등 */
  subjectType: string;
  subjectName?: string | null;
  subjectAgeRange?: string | null;
  question?: string | null;
  /** 희망 통화 시각 (ISO). null이면 "아무 때나" */
  preferredSlotAt: string | null;
  anyTimeOk: boolean;
  createdAt: string;
}

export interface NotifyChannel {
  name: string;
  /** 설정이 갖춰져 실제로 보낼 수 있는 상태인가 */
  isConfigured(): boolean;
  send(notification: BookingNotification): Promise<void>;
}
