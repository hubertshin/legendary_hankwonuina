import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-warm-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-warm-800">
            한권의나
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>이메일을 확인하세요</CardTitle>
            <CardDescription>
              로그인 링크가 이메일로 전송되었습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">
              이메일에 있는 링크를 클릭하여 로그인을 완료하세요.
              <br />
              이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
            </p>
            <p className="text-sm text-muted-foreground">
              링크는 24시간 동안 유효합니다.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-warm-600">
          <Link href="/login" className="hover:text-warm-800">
            ← 로그인 페이지로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
