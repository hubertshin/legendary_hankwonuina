/**
 * 알림 발송 상태 표시.
 *
 * 발송이 조용히 실패하면 아무도 모른다. 실제로 API 키가 무효화된 동안 신청
 * 두 건의 알림이 유실됐고, 고객이 알려주기 전까지 알 수 없었다.
 *
 * 재발송 버튼은 두지 않는다. 이 배지가 보이는 시점에는 운영자가 이미 admin
 * 목록을 보고 있고, 필요한 정보(이름·연락처·희망 시각)가 화면에 다 있다.
 * 자기 자신에게 같은 내용을 메일로 다시 보내는 것은 아무것도 더해주지 않는다.
 *
 * 이 배지의 쓸모는 "이 건은 알림을 못 받았으니 놓쳤을 수 있다"를 알려주는 것이다.
 */

interface Props {
  notifiedAt: string | null;
  notifyError: string | null;
}

export function NotifyStatusCell({ notifiedAt, notifyError }: Props) {
  if (notifiedAt) {
    return (
      <span
        className="text-xs text-muted-foreground"
        title={new Date(notifiedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
      >
        발송됨
      </span>
    );
  }

  return (
    <span
      className="inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-900"
      title={notifyError ?? "알림이 발송되지 않았습니다"}
    >
      메일 미발송
    </span>
  );
}
